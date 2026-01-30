import Link from 'next/link';
import { DiagnosticsCounter } from '@/components/landing/DiagnosticsCounter';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-6">📊</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Diagnóstico de Rentabilidad
        </h1>
        <p className="text-gray-600 mb-6">
          Plataforma SaaS para gestorías y asesorías que quieren ayudar a sus clientes
          a identificar oportunidades de mejora.
        </p>

        {/* Diagnostics counter */}
        <div className="mb-8">
          <DiagnosticsCounter />
        </div>

        <div className="space-y-3">
          <Link
            href="/d/demo"
            className="block w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Ver demo del diagnóstico
          </Link>
          <Link
            href="/registro"
            className="block w-full py-3 px-6 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Registrar mi gestoría
          </Link>
          <Link
            href="/login"
            className="block w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Acceso gestorías
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-8">
          Si eres administrador, accede a /admin
        </p>
      </div>
    </div>
  );
}
