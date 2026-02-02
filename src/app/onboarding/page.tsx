'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type OnboardingStep = 'welcome' | 'branding' | 'webhook' | 'complete';

interface TenantData {
  id: string;
  name: string;
  slug: string;
  brand_color: string;
  logo_url: string | null;
  webhook_url: string | null;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [brandColor, setBrandColor] = useState('#2563eb');
  const [logoUrl, setLogoUrl] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  const loadTenantData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { data: userData } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!userData?.tenant_id) {
      router.push('/dashboard');
      return;
    }

    const { data: tenantData } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', userData.tenant_id)
      .single();

    if (tenantData) {
      setTenant(tenantData);
      setBrandColor(tenantData.brand_color || '#2563eb');
      setLogoUrl(tenantData.logo_url || '');
      setWebhookUrl(tenantData.webhook_url || '');
    }

    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    loadTenantData();
  }, [loadTenantData]);

  const saveBranding = async () => {
    if (!tenant) return;
    setIsSaving(true);

    const supabase = createClient();
    await supabase
      .from('tenants')
      .update({
        brand_color: brandColor,
        logo_url: logoUrl || null,
      })
      .eq('id', tenant.id);

    setIsSaving(false);
    setStep('webhook');
  };

  const saveWebhook = async () => {
    if (!tenant) return;
    setIsSaving(true);

    const supabase = createClient();
    await supabase
      .from('tenants')
      .update({
        webhook_url: webhookUrl || null,
      })
      .eq('id', tenant.id);

    setIsSaving(false);
    setStep('complete');
  };

  const skipWebhook = () => {
    setStep('complete');
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        {/* Progress indicator */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            {['welcome', 'branding', 'webhook', 'complete'].map((s, i) => (
              <div
                key={s}
                className={`flex items-center ${i < 3 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s
                      ? 'bg-blue-600 text-white'
                      : ['welcome', 'branding', 'webhook', 'complete'].indexOf(step) > i
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {['welcome', 'branding', 'webhook', 'complete'].indexOf(step) > i ? '✓' : i + 1}
                </div>
                {i < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      ['welcome', 'branding', 'webhook', 'complete'].indexOf(step) > i
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step: Welcome */}
        {step === 'welcome' && (
          <>
            <CardHeader className="text-center">
              <div className="text-5xl mb-4">🎉</div>
              <CardTitle className="text-2xl">¡Bienvenido a tu cuenta!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-gray-600">
                <p className="mb-4">
                  Tu gestoría <strong>{tenant?.name}</strong> está lista.
                </p>
                <p>
                  Vamos a configurar un par de cosas para que puedas empezar a recibir diagnósticos.
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tu enlace de diagnóstico:</strong>
                </p>
                <code className="text-sm text-blue-600 break-all">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/d/{tenant?.slug}
                </code>
              </div>
              <Button onClick={() => setStep('branding')} className="w-full">
                Empezar configuración
              </Button>
            </CardContent>
          </>
        )}

        {/* Step: Branding */}
        {step === 'branding' && (
          <>
            <CardHeader>
              <CardTitle>Personaliza tu marca</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color principal
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer border-0"
                  />
                  <Input
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    placeholder="#2563eb"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Este color se usará en botones y acentos del diagnóstico
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del logo (opcional)
                </label>
                <Input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://tugestoria.com/logo.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Aparecerá en el diagnóstico y en los PDFs
                </p>
              </div>

              {logoUrl && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Vista previa:</p>
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="max-h-16 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('welcome')}
                  className="flex-1"
                >
                  Atrás
                </Button>
                <Button
                  onClick={saveBranding}
                  isLoading={isSaving}
                  className="flex-1"
                >
                  Siguiente
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* Step: Webhook */}
        {step === 'webhook' && (
          <>
            <CardHeader>
              <CardTitle>Conecta con Make/Zapier (opcional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600 text-sm">
                Recibe notificaciones automáticas cuando alguien complete un diagnóstico.
                Puedes conectarlo con tu CRM, email, Slack, etc.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del Webhook
                </label>
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://hook.make.com/xxx..."
                />
              </div>

              <div className="bg-amber-50 p-4 rounded-lg text-sm">
                <p className="font-medium text-amber-800 mb-2">¿Cómo funciona?</p>
                <ol className="text-amber-700 space-y-1 list-decimal list-inside">
                  <li>Crea un escenario en Make.com o Zapier</li>
                  <li>Añade un trigger de tipo Webhook</li>
                  <li>Copia la URL y pégala aquí</li>
                  <li>Recibirás datos del diagnóstico automáticamente</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('branding')}
                  className="flex-1"
                >
                  Atrás
                </Button>
                <Button
                  variant="outline"
                  onClick={skipWebhook}
                  className="flex-1"
                >
                  Saltar
                </Button>
                <Button
                  onClick={saveWebhook}
                  isLoading={isSaving}
                  className="flex-1"
                >
                  Guardar
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* Step: Complete */}
        {step === 'complete' && (
          <>
            <CardHeader className="text-center">
              <div className="text-5xl mb-4">🚀</div>
              <CardTitle className="text-2xl">¡Todo listo!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-gray-600">
                <p>Tu cuenta está configurada y lista para recibir diagnósticos.</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg space-y-3">
                <p className="font-medium text-green-800">Próximos pasos:</p>
                <ul className="text-sm text-green-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span>1.</span>
                    <span>Comparte tu enlace de diagnóstico con tus clientes potenciales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>2.</span>
                    <span>Revisa los diagnósticos completados en tu dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>3.</span>
                    <span>Contacta a los leads con urgencia alta primero</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Tu enlace:</p>
                <code className="text-sm text-blue-600 break-all">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/d/{tenant?.slug}
                </code>
              </div>

              <Button onClick={goToDashboard} className="w-full">
                Ir al Dashboard
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
