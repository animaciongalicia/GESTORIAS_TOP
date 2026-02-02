'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FormData {
  gestoriaName: string;
  slug: string;
  brandColor: string;
  email: string;
  password: string;
  fullName: string;
}

export default function RegistroPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    gestoriaName: '',
    slug: '',
    brandColor: '#2563eb',
    email: '',
    password: '',
    fullName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSlugGeneration = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
    setFormData((prev) => ({ ...prev, gestoriaName: name, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar');
      }

      // Auto-login after registration
      const supabase = createClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (loginError) {
        // If auto-login fails, show success and redirect to login
        setSuccess(true);
        return;
      }

      // Redirect to onboarding
      router.push('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Registro completado!
            </h1>
            <p className="text-gray-600 mb-6">
              Hemos enviado un email de confirmación a <strong>{formData.email}</strong>.
              Por favor, verifica tu correo para activar tu cuenta.
            </p>
            <Link href="/login">
              <Button>Ir al login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Registra tu Gestoría
          </h1>
          <p className="text-gray-600 mt-2">
            Obtén tu propio diagnóstico de rentabilidad personalizado
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Paso {step} de 2: {step === 1 ? 'Datos de la gestoría' : 'Tu cuenta'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-4">
                  <Input
                    label="Nombre de tu gestoría"
                    value={formData.gestoriaName}
                    onChange={(e) => handleSlugGeneration(e.target.value)}
                    placeholder="Ej: Asesoría García"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL de tu diagnóstico
                    </label>
                    <div className="flex items-center">
                      <span className="text-gray-500 text-sm mr-1">/d/</span>
                      <Input
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                          }))
                        }
                        placeholder="asesoria-garcia"
                        required
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Tus clientes accederán en: /d/{formData.slug || 'tu-slug'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color de marca
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.brandColor}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, brandColor: e.target.value }))
                        }
                        className="w-12 h-10 rounded border cursor-pointer"
                      />
                      <span className="text-sm text-gray-600">{formData.brandColor}</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!formData.gestoriaName || !formData.slug}
                      className="w-full"
                    >
                      Continuar
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <Input
                    label="Tu nombre completo"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    placeholder="Juan García"
                    required
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="tu@email.com"
                    required
                  />

                  <Input
                    label="Contraseña"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength={8}
                  />

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="pt-4 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      disabled={isSubmitting}
                    >
                      Atrás
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !formData.email || !formData.password}
                      isLoading={isSubmitting}
                      className="flex-1"
                    >
                      Crear cuenta
                    </Button>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-6 pt-6 border-t text-center text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Iniciar sesión
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {step === 1 && formData.gestoriaName && (
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-2">Vista previa:</p>
            <Card>
              <div
                className="h-2"
                style={{ backgroundColor: formData.brandColor }}
              />
              <CardContent className="p-4">
                <span
                  className="font-semibold"
                  style={{ color: formData.brandColor }}
                >
                  {formData.gestoriaName}
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  Diagnóstico de Rentabilidad
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
