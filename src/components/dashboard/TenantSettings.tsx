'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tenant } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TenantSettingsProps {
  tenant: Tenant;
}

export function TenantSettings({ tenant }: TenantSettingsProps) {
  const router = useRouter();
  const [name, setName] = useState(tenant.name);
  const [brandColor, setBrandColor] = useState(tenant.brand_color);
  const [webhookUrl, setWebhookUrl] = useState(tenant.webhook_url || '');
  const [sendContactToMake, setSendContactToMake] = useState(tenant.send_contact_to_make);
  const [notificationEmail, setNotificationEmail] = useState(tenant.notification_email || '');
  const [notifyHighUrgency, setNotifyHighUrgency] = useState(tenant.notify_high_urgency !== false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    const supabase = createClient();

    const { error } = await supabase
      .from('tenants')
      .update({
        name,
        brand_color: brandColor,
        webhook_url: webhookUrl || null,
        send_contact_to_make: sendContactToMake,
        notification_email: notificationEmail || null,
        notify_high_urgency: notifyHighUrgency,
      })
      .eq('id', tenant.id);

    if (error) {
      setMessage({ type: 'error', text: 'Error al guardar: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Configuración guardada' });
      router.refresh();
    }

    setIsSaving(false);
  };

  const wizardUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/d/${tenant.slug}`;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Nombre de tu gestoría"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Gestoría Madrid Centro"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color de marca
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <Input
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                placeholder="#2563eb"
                className="w-32"
              />
              <div
                className="px-4 py-2 rounded text-white text-sm"
                style={{ backgroundColor: brandColor }}
              >
                Vista previa
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook */}
      <Card>
        <CardHeader>
          <CardTitle>Integración Make (Webhook)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="URL del webhook de Make"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://hook.eu1.make.com/..."
          />
          <p className="text-sm text-gray-500">
            Cada vez que alguien complete un diagnóstico, enviaremos los datos al webhook.
          </p>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="sendContact"
              checked={sendContactToMake}
              onChange={(e) => setSendContactToMake(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="sendContact" className="text-sm text-gray-700">
              Incluir email y teléfono en el webhook (si el usuario los proporciona)
            </label>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Datos enviados al webhook:</p>
            <pre className="text-xs text-gray-600 overflow-x-auto">
{`{
  "tenant_slug": "${tenant.slug}",
  "submission_id": "uuid",
  "grade": "A|B|C",
  "urgency": "high|medium|low",
  "red_areas": ["control", "precios"],
  "created_at": "2024-01-01T12:00:00Z"${sendContactToMake ? `,
  "email": "opcional",
  "phone": "opcional"` : ''}
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones por Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Email para notificaciones"
            type="email"
            value={notificationEmail}
            onChange={(e) => setNotificationEmail(e.target.value)}
            placeholder="alertas@tugestoria.com"
          />
          <p className="text-sm text-gray-500">
            Recibirás notificaciones cuando se complete un diagnóstico con urgencia alta.
          </p>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="notifyHighUrgency"
              checked={notifyHighUrgency}
              onChange={(e) => setNotifyHighUrgency(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="notifyHighUrgency" className="text-sm text-gray-700">
              Enviar email cuando hay diagnósticos con urgencia alta
            </label>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Nota:</strong> Para activar las notificaciones por email, el administrador
              debe configurar la clave <code className="bg-amber-100 px-1 rounded">RESEND_API_KEY</code> en las variables de entorno.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Wizard URL */}
      <Card>
        <CardHeader>
          <CardTitle>URL de tu diagnóstico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              value={wizardUrl}
              readOnly
              className="bg-gray-50"
            />
            <Button
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(wizardUrl);
                setMessage({ type: 'success', text: 'URL copiada' });
              }}
            >
              Copiar
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Comparte esta URL con tus clientes potenciales.
          </p>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} isLoading={isSaving}>
          Guardar cambios
        </Button>
        {message && (
          <p className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
