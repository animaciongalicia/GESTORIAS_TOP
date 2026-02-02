-- =============================================
-- TRIGGER: Auto-crear registro en users cuando se registra en Auth
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Función que se ejecuta cuando se crea un usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo insertar si no existe ya (evitar duplicados)
  INSERT INTO public.users (id, email, full_name, role, tenant_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'advisor'),
    (NEW.raw_user_meta_data->>'tenant_id')::uuid
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear trigger que se ejecuta después de INSERT en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- NOTA: Este trigger se ejecutará automáticamente cuando:
-- 1. Un usuario se registra via signUp()
-- 2. Un admin crea un usuario via admin.createUser()
--
-- Los metadatos (full_name, role, tenant_id) se pasan en user_metadata
-- =============================================
