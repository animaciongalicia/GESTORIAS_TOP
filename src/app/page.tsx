import Link from 'next/link';
import { DiagnosticsCounter } from '@/components/landing/DiagnosticsCounter';

const PAIN_POINTS = [
  {
    emoji: '😰',
    title: 'Clientes que no saben cuánto ganan',
    description: 'La mayoría de pymes no tiene claro si su negocio es rentable de verdad',
  },
  {
    emoji: '🔥',
    title: 'Apagando fuegos constantemente',
    description: 'Tus clientes viven en modo supervivencia sin tiempo para mejorar',
  },
  {
    emoji: '💸',
    title: 'Precios desactualizados',
    description: 'Muchos no han subido precios en años mientras los costes suben',
  },
  {
    emoji: '😓',
    title: 'Dependencia total del dueño',
    description: 'Si el empresario para, todo para. No hay negocio, hay autoempleo',
  },
];

const BENEFITS = [
  {
    emoji: '🎯',
    title: 'Capta leads cualificados',
    description: 'Los que completan el diagnóstico ya saben que necesitan ayuda',
  },
  {
    emoji: '📊',
    title: 'Diagnóstico profesional',
    description: '14 preguntas que analizan Control, Precios, Operaciones y Ventas',
  },
  {
    emoji: '🏷️',
    title: 'Tu marca, tu herramienta',
    description: 'Personaliza colores, logo y textos con tu identidad corporativa',
  },
  {
    emoji: '🔔',
    title: 'Alertas automáticas',
    description: 'Recibe email cuando hay un lead con urgencia alta',
  },
  {
    emoji: '📈',
    title: 'Analytics completo',
    description: 'Dashboard con métricas, filtros y exportación a CSV',
  },
  {
    emoji: '🔗',
    title: 'Integración con Make/Zapier',
    description: 'Conecta con tu CRM y automatiza el seguimiento',
  },
];

const STEPS = [
  {
    number: 1,
    title: 'Registra tu gestoría',
    description: 'Crea tu cuenta en 2 minutos y personaliza tu diagnóstico',
  },
  {
    number: 2,
    title: 'Comparte tu enlace',
    description: 'Envía /d/tu-gestoria a clientes potenciales',
  },
  {
    number: 3,
    title: 'Recibe leads cualificados',
    description: 'Los interesados completan el diagnóstico y tú ves los resultados',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <span className="font-bold text-gray-900">DiagnósticoRentabilidad</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Acceder
            </Link>
            <Link
              href="/registro"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Registrar gestoría
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Ayuda a tus clientes a descubrir<br />
            <span className="text-blue-400">dónde pierden dinero</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Diagnóstico de rentabilidad personalizado para tu gestoría.
            Capta leads cualificados que ya saben que necesitan ayuda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/d/demo"
              className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Ver demo del diagnóstico
            </Link>
            <Link
              href="/registro"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Registrar mi gestoría gratis
            </Link>
          </div>
          <div className="mt-8">
            <DiagnosticsCounter />
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            El problema de tus clientes
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            La mayoría de pymes no tiene visibilidad real sobre la salud de su negocio.
            Tú puedes ayudarles a identificar los problemas.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PAIN_POINTS.map((point, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <span className="text-4xl mb-4 block">{point.emoji}</span>
                <h3 className="font-semibold text-gray-900 mb-2">{point.title}</h3>
                <p className="text-gray-600 text-sm">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Qué ofrece la plataforma
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Todo lo que necesitas para convertir el diagnóstico en una herramienta
            de captación para tu gestoría.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((benefit, index) => (
              <div
                key={index}
                className="flex gap-4 p-6 bg-blue-50 rounded-xl"
              >
                <span className="text-3xl">{benefit.emoji}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Cómo funciona
          </h2>
          <div className="space-y-8">
            {STEPS.map((step) => (
              <div key={step.number} className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                  {step.number}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Empieza a captar leads cualificados hoy
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Registro gratuito. Sin tarjeta de crédito. Configura tu diagnóstico en menos de 5 minutos.
          </p>
          <Link
            href="/registro"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Registrar mi gestoría gratis →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">📊</span>
            <span className="font-bold text-white">DiagnósticoRentabilidad</span>
          </div>
          <p className="text-sm mb-4">
            Plataforma SaaS de diagnóstico de rentabilidad para gestorías y asesorías
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/login" className="hover:text-white">Acceso gestorías</Link>
            <Link href="/registro" className="hover:text-white">Registrar gestoría</Link>
            <Link href="/d/demo" className="hover:text-white">Ver demo</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
