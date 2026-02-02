'use client';

import { Tenant } from '@/types';
import { Button } from '@/components/ui/button';

interface TenantLandingProps {
  tenant: Tenant;
  onStart: () => void;
}

const PAIN_POINTS = [
  { emoji: '😰', text: 'No sé cuánto gano realmente cada mes' },
  { emoji: '🔥', text: 'Vivo apagando fuegos constantemente' },
  { emoji: '💸', text: 'No he subido precios en más de un año' },
  { emoji: '😓', text: 'Si yo paro, todo para' },
];

const BENEFITS = [
  { emoji: '📊', text: 'Diagnóstico de 4 áreas clave de tu negocio' },
  { emoji: '🎯', text: 'Tu nota de salud financiera (A, B o C)' },
  { emoji: '✅', text: '3 acciones prioritarias para mejorar' },
  { emoji: '📈', text: 'Comparación con empresas de tu sector' },
];

const STEPS = [
  { number: 1, text: 'Responde 14 preguntas (5 minutos)' },
  { number: 2, text: 'Recibe tu diagnóstico al instante' },
  { number: 3, text: 'Opcional: pide ayuda a un experto' },
];

export function TenantLanding({ tenant, onStart }: TenantLandingProps) {
  const headline = tenant.landing_headline || '¿Tu negocio te da dinero o te lo quita?';
  const subheadline = tenant.landing_subheadline || 'Descubre en 5 minutos dónde se te escapa la rentabilidad de tu negocio';
  const ctaText = tenant.landing_cta_text || 'Hacer diagnóstico gratis';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          {tenant.logo_url && (
            <img
              src={tenant.logo_url}
              alt={tenant.name}
              className="h-10 object-contain"
            />
          )}
          <span
            className="font-semibold text-lg"
            style={{ color: tenant.brand_color }}
          >
            {tenant.name}
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {headline}
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            {subheadline}
          </p>
          <Button
            onClick={onStart}
            className="text-lg px-8 py-4 h-auto"
            style={{ backgroundColor: tenant.brand_color }}
          >
            {ctaText} →
          </Button>
          <p className="text-sm text-gray-400 mt-4">
            100% gratuito · Sin registro · Resultados inmediatos
          </p>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            ¿Te identificas con alguna de estas situaciones?
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {PAIN_POINTS.map((point, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-red-50 border border-red-100 rounded-lg"
              >
                <span className="text-3xl">{point.emoji}</span>
                <span className="text-gray-700">{point.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Qué obtienes con el diagnóstico
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {BENEFITS.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <span className="text-3xl">{benefit.emoji}</span>
                <span className="text-gray-700">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Cómo funciona
          </h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {STEPS.map((step) => (
              <div key={step.number} className="flex items-center gap-4 md:flex-col md:text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
                  style={{ backgroundColor: tenant.brand_color }}
                >
                  {step.number}
                </div>
                <span className="text-gray-700">{step.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-16 px-4"
        style={{ backgroundColor: tenant.brand_color }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            ¿Listo para descubrir cómo está tu negocio?
          </h2>
          <Button
            onClick={onStart}
            className="text-lg px-8 py-4 h-auto bg-white hover:bg-gray-100"
            style={{ color: tenant.brand_color }}
          >
            {ctaText} →
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-center">
        <p className="text-gray-400 text-sm">
          Diagnóstico ofrecido por{' '}
          <span className="text-white">{tenant.name}</span>
        </p>
      </footer>
    </div>
  );
}
