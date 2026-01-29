-- =============================================
-- SEED DATA: Datos de prueba
-- =============================================

-- Primero, crea los usuarios en Supabase Auth Dashboard:
-- 1. admin@example.com (será el admin)
-- 2. advisor@gestoria-demo.com (será advisor de la gestoría demo)
-- 3. advisor@gestoria-madrid.com (será advisor de la gestoría madrid)

-- Luego ejecuta este script con los UUIDs correctos de auth.users

-- =============================================
-- TENANTS
-- =============================================

INSERT INTO tenants (id, slug, name, brand_color, webhook_url, send_contact_to_make, is_active) VALUES
    ('11111111-1111-1111-1111-111111111111', 'demo', 'Gestoría Demo', '#2563eb', NULL, false, true),
    ('22222222-2222-2222-2222-222222222222', 'gestoria-madrid', 'Gestoría Madrid Centro', '#dc2626', NULL, false, true),
    ('33333333-3333-3333-3333-333333333333', 'asesores-bcn', 'Asesores Barcelona', '#059669', NULL, false, true);

-- =============================================
-- USERS (after creating in Auth)
-- =============================================
-- IMPORTANTE: Reemplaza estos UUIDs con los reales de auth.users
-- Puedes encontrarlos en Supabase Dashboard > Authentication > Users

-- Ejemplo de cómo insertar usuarios después de crearlos en Auth:
-- INSERT INTO users (id, email, role, tenant_id, full_name) VALUES
--     ('UUID-DEL-ADMIN-AQUI', 'admin@example.com', 'admin', NULL, 'Pablo Admin'),
--     ('UUID-DEL-ADVISOR-DEMO', 'advisor@gestoria-demo.com', 'advisor', '11111111-1111-1111-1111-111111111111', 'María García'),
--     ('UUID-DEL-ADVISOR-MADRID', 'advisor@gestoria-madrid.com', 'advisor', '22222222-2222-2222-2222-222222222222', 'Carlos López');

-- =============================================
-- SAMPLE SUBMISSIONS (para pruebas)
-- =============================================

INSERT INTO submissions (tenant_id, company_name, sector, revenue_range, employees_range, email, phone, answers, scores, grade, urgency, triggers, opt_in_help, created_at) VALUES
-- Submissions para Gestoría Demo
(
    '11111111-1111-1111-1111-111111111111',
    'Restaurante El Buen Sabor',
    'Hostelería / Restauración',
    '100.000€ - 300.000€',
    '4 - 10 empleados',
    'contacto@buensabor.es',
    '+34 612 345 678',
    '{"q1": 2, "q2": 2, "q3": 3, "q4": 3, "q5": 2, "q6": 2, "q7": 3, "q8": 2, "q9": 2, "q10": 2, "q11": 3, "q12": 2, "q13": 3, "q14": 2}',
    '{"control": 38, "precios": 38, "operaciones": 42, "ventas": 33, "total": 38}',
    'C',
    'high',
    ARRAY['caja_no_semanal', 'precios_desactualizados', 'urgencias_constantes'],
    true,
    NOW() - INTERVAL '2 days'
),
(
    '11111111-1111-1111-1111-111111111111',
    'Clínica Dental Sonrisas',
    'Salud / Bienestar',
    '500.000€ - 1M€',
    '11 - 25 empleados',
    'admin@clinicasonrisas.es',
    '+34 623 456 789',
    '{"q1": 4, "q2": 4, "q3": 5, "q4": 4, "q5": 4, "q6": 4, "q7": 4, "q8": 4, "q9": 4, "q10": 4, "q11": 4, "q12": 4, "q13": 4, "q14": 4}',
    '{"control": 81, "precios": 75, "operaciones": 75, "ventas": 75, "total": 77}',
    'A',
    'low',
    ARRAY[]::TEXT[],
    false,
    NOW() - INTERVAL '5 days'
),
(
    '11111111-1111-1111-1111-111111111111',
    'Taller Mecánico Rodríguez',
    'Automoción',
    '50.000€ - 100.000€',
    '1 - 3 empleados',
    NULL,
    '+34 634 567 890',
    '{"q1": 1, "q2": 1, "q3": 1, "q4": 2, "q5": 1, "q6": 1, "q7": 1, "q8": 1, "q9": 1, "q10": 1, "q11": 1, "q12": 1, "q13": 1, "q14": 1}',
    '{"control": 6, "precios": 0, "operaciones": 0, "ventas": 0, "total": 2}',
    'C',
    'high',
    ARRAY['caja_no_semanal', 'precios_desactualizados', 'descuentos_frecuentes', 'urgencias_constantes', 'dependencia_alta', 'dependencia_cliente'],
    true,
    NOW() - INTERVAL '1 day'
),

-- Submissions para Gestoría Madrid
(
    '22222222-2222-2222-2222-222222222222',
    'Boutique Elegance',
    'Retail / Comercio',
    '100.000€ - 300.000€',
    '4 - 10 empleados',
    'info@boutiqueelegance.es',
    '+34 645 678 901',
    '{"q1": 3, "q2": 3, "q3": 3, "q4": 3, "q5": 3, "q6": 3, "q7": 3, "q8": 3, "q9": 3, "q10": 3, "q11": 3, "q12": 3, "q13": 3, "q14": 3}',
    '{"control": 50, "precios": 50, "operaciones": 50, "ventas": 50, "total": 50}',
    'B',
    'medium',
    ARRAY[]::TEXT[],
    false,
    NOW() - INTERVAL '3 days'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Constructora Edificar',
    'Construcción / Reformas',
    '1M€ - 3M€',
    '26 - 50 empleados',
    'gerencia@edificar.es',
    '+34 656 789 012',
    '{"q1": 2, "q2": 1, "q3": 2, "q4": 2, "q5": 1, "q6": 2, "q7": 2, "q8": 1, "q9": 2, "q10": 1, "q11": 2, "q12": 1, "q13": 2, "q14": 1}',
    '{"control": 19, "precios": 13, "operaciones": 17, "ventas": 8, "total": 14}',
    'C',
    'high',
    ARRAY['caja_no_semanal', 'precios_desactualizados', 'descuentos_frecuentes', 'urgencias_constantes', 'dependencia_alta', 'dependencia_cliente'],
    true,
    NOW() - INTERVAL '1 day'
),

-- Submissions para Asesores BCN
(
    '33333333-3333-3333-3333-333333333333',
    'Startup TechInnovate',
    'Tecnología / Digital',
    '500.000€ - 1M€',
    '11 - 25 empleados',
    'ceo@techinnovate.io',
    '+34 667 890 123',
    '{"q1": 5, "q2": 5, "q3": 5, "q4": 5, "q5": 5, "q6": 5, "q7": 5, "q8": 5, "q9": 5, "q10": 5, "q11": 5, "q12": 5, "q13": 5, "q14": 5}',
    '{"control": 100, "precios": 100, "operaciones": 100, "ventas": 100, "total": 100}',
    'A',
    'low',
    ARRAY[]::TEXT[],
    false,
    NOW() - INTERVAL '4 days'
);

-- =============================================
-- VERIFICACIÓN
-- =============================================

-- Después de ejecutar, verifica con:
-- SELECT * FROM tenants;
-- SELECT * FROM users;
-- SELECT * FROM submissions;
-- SELECT * FROM tenant_aggregates;
-- SELECT * FROM get_admin_tenant_aggregates();
