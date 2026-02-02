-- =============================================
-- Añadir campos adicionales a tenants
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Añadir columna para logo
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Añadir columna para email de notificaciones
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS notification_email TEXT;

-- Añadir columna para activar/desactivar notificaciones de urgencia alta
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS notify_high_urgency BOOLEAN DEFAULT true;

-- Comentarios
COMMENT ON COLUMN tenants.logo_url IS 'URL del logo de la gestoría';
COMMENT ON COLUMN tenants.notification_email IS 'Email donde enviar notificaciones de diagnósticos';
COMMENT ON COLUMN tenants.notify_high_urgency IS 'Enviar email cuando hay diagnóstico con urgencia alta';
