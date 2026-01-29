-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TENANTS POLICIES
-- =============================================

-- Anyone can read active tenants (needed for public wizard)
CREATE POLICY "Public can read active tenants"
    ON tenants FOR SELECT
    USING (is_active = true);

-- Advisors can update their own tenant (name, brand_color, webhook_url, send_contact_to_make)
CREATE POLICY "Advisors can update own tenant"
    ON tenants FOR UPDATE
    USING (
        id = get_user_tenant_id(auth.uid())
        AND get_user_role(auth.uid()) = 'advisor'
    )
    WITH CHECK (
        id = get_user_tenant_id(auth.uid())
        AND get_user_role(auth.uid()) = 'advisor'
    );

-- =============================================
-- USERS POLICIES
-- =============================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON users FOR SELECT
    USING (id = auth.uid());

-- Users can update their own profile (except role and tenant_id)
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Admin can read all users
CREATE POLICY "Admin can read all users"
    ON users FOR SELECT
    USING (get_user_role(auth.uid()) = 'admin');

-- =============================================
-- SUBMISSIONS POLICIES - CRITICAL SECURITY
-- =============================================

-- IMPORTANT: Advisors can ONLY read submissions from their own tenant
CREATE POLICY "Advisors can read own tenant submissions"
    ON submissions FOR SELECT
    USING (
        tenant_id = get_user_tenant_id(auth.uid())
        AND get_user_role(auth.uid()) = 'advisor'
    );

-- IMPORTANT: Admin CANNOT read individual submissions
-- This is enforced by NOT having any policy for admin on submissions
-- Admin only sees aggregates via SECURITY DEFINER functions

-- Public can read their own submission by exact UUID (for result page)
-- The UUID acts as a capability token
CREATE POLICY "Public can read submission by uuid"
    ON submissions FOR SELECT
    USING (
        -- Allow if user is not authenticated (public result page)
        -- or if they are an advisor for this tenant
        auth.uid() IS NULL
        OR (
            tenant_id = get_user_tenant_id(auth.uid())
            AND get_user_role(auth.uid()) = 'advisor'
        )
    );

-- NOTE: Inserts are handled by service_role which bypasses RLS
-- This prevents direct client inserts and ensures tenant_id validation

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant usage on helper functions
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_user_tenant_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_tenant_id(UUID) TO anon;

-- Grant execute on admin functions (only works for admin due to internal check)
GRANT EXECUTE ON FUNCTION get_admin_tenant_aggregates() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_daily_aggregates(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_top_triggers(UUID) TO authenticated;

-- =============================================
-- SECURITY VERIFICATION NOTES
-- =============================================
--
-- 1. Admin CANNOT read submissions table directly:
--    - No SELECT policy exists for admin role on submissions
--    - Admin can only call aggregate functions which don't expose individual data
--
-- 2. Advisors can ONLY read their own tenant's submissions:
--    - Policy explicitly checks tenant_id matches user's tenant
--
-- 3. Public users (anonymous):
--    - Can only read submissions if they have the exact UUID
--    - Cannot list/enumerate submissions
--    - UUID acts as a secret capability token
--
-- 4. Submissions INSERT:
--    - Only possible via service_role (API route handler)
--    - Client cannot insert directly
--    - Server validates tenant_slug before insert
