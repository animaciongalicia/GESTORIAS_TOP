-- =============================================
-- Añadir campos de personalización de landing a tenants
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Añadir columnas para personalización de la landing
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS landing_headline TEXT DEFAULT '¿Tu negocio te da dinero o te lo quita?';

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS landing_subheadline TEXT DEFAULT 'Descubre en 5 minutos dónde se te escapa la rentabilidad de tu negocio';

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS landing_cta_text TEXT DEFAULT 'Hacer diagnóstico gratis';

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS show_landing_page BOOLEAN DEFAULT false;

-- Comentarios
COMMENT ON COLUMN tenants.landing_headline IS 'Título principal de la landing del tenant';
COMMENT ON COLUMN tenants.landing_subheadline IS 'Subtítulo de la landing del tenant';
COMMENT ON COLUMN tenants.landing_cta_text IS 'Texto del botón CTA de la landing';
COMMENT ON COLUMN tenants.show_landing_page IS 'Mostrar landing antes del wizard';
