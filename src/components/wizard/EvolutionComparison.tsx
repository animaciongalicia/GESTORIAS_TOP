'use client';

import { Submission, AreaCategory } from '@/types';
import { AREA_INFO } from '@/lib/utils/scoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EvolutionComparisonProps {
  currentSubmission: Submission;
  previousSubmission: Submission;
}

export function EvolutionComparison({ currentSubmission, previousSubmission }: EvolutionComparisonProps) {
  const areas: AreaCategory[] = ['control', 'precios', 'operaciones', 'ventas'];

  const getChange = (current: number, previous: number) => {
    const diff = current - previous;
    return {
      value: diff,
      isPositive: diff > 0,
      isNeutral: diff === 0,
    };
  };

  const totalChange = getChange(currentSubmission.scores.total, previousSubmission.scores.total);
  const gradeImproved =
    (currentSubmission.grade === 'A' && previousSubmission.grade !== 'A') ||
    (currentSubmission.grade === 'B' && previousSubmission.grade === 'C');
  const gradeWorsened =
    (currentSubmission.grade === 'C' && previousSubmission.grade !== 'C') ||
    (currentSubmission.grade === 'B' && previousSubmission.grade === 'A');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const daysSince = Math.floor(
    (new Date(currentSubmission.created_at).getTime() - new Date(previousSubmission.created_at).getTime()) /
    (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Evolución desde tu último diagnóstico
        </CardTitle>
        <p className="text-sm text-blue-600">
          Comparando con el diagnóstico del {formatDate(previousSubmission.created_at)} (hace {daysSince} días)
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall change */}
        <div className="text-center p-4 bg-white rounded-lg">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-400">
                {previousSubmission.scores.total}%
              </div>
              <div className="text-xs text-gray-400">Antes</div>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {currentSubmission.scores.total}%
              </div>
              <div className="text-xs text-gray-500">Ahora</div>
            </div>

            <div className={`ml-4 px-3 py-1 rounded-full text-lg font-bold ${
              totalChange.isPositive
                ? 'bg-green-100 text-green-700'
                : totalChange.isNeutral
                ? 'bg-gray-100 text-gray-600'
                : 'bg-red-100 text-red-700'
            }`}>
              {totalChange.isPositive ? '+' : ''}{totalChange.value}%
            </div>
          </div>

          {/* Grade change message */}
          {gradeImproved && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <strong>¡Enhorabuena!</strong> Has mejorado tu calificación de {previousSubmission.grade} a {currentSubmission.grade}
            </div>
          )}
          {gradeWorsened && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              Tu calificación ha bajado de {previousSubmission.grade} a {currentSubmission.grade}. Revisa las áreas que han empeorado.
            </div>
          )}
        </div>

        {/* Area by area comparison */}
        <div className="space-y-3">
          {areas.map((area) => {
            const areaInfo = AREA_INFO[area];
            const change = getChange(
              currentSubmission.scores[area],
              previousSubmission.scores[area]
            );

            return (
              <div key={area} className="flex items-center gap-4 p-3 bg-white rounded-lg">
                <div className="text-2xl">{areaInfo.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{areaInfo.name}</div>
                  <div className="text-sm text-gray-500">
                    {previousSubmission.scores[area]}% → {currentSubmission.scores[area]}%
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  change.isPositive
                    ? 'bg-green-100 text-green-700'
                    : change.isNeutral
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {change.isPositive ? '+' : ''}{change.value}%
                  {change.isPositive && ' ↑'}
                  {!change.isPositive && !change.isNeutral && ' ↓'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Triggers comparison */}
        {previousSubmission.triggers.length > 0 && (
          <div className="p-4 bg-white rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Problemas resueltos</h4>
            <div className="space-y-1">
              {previousSubmission.triggers
                .filter(t => !currentSubmission.triggers.includes(t))
                .map(trigger => (
                  <div key={trigger} className="flex items-center gap-2 text-sm text-green-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {formatTriggerText(trigger)}
                  </div>
                ))}
              {previousSubmission.triggers.filter(t => !currentSubmission.triggers.includes(t)).length === 0 && (
                <p className="text-sm text-gray-500">Ningún problema resuelto todavía</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatTriggerText(trigger: string): string {
  const texts: Record<string, string> = {
    caja_no_semanal: 'Ahora revisas la caja semanalmente',
    precios_desactualizados: 'Has actualizado tus precios',
    descuentos_frecuentes: 'Has reducido los descuentos',
    urgencias_constantes: 'Has mejorado la gestión de urgencias',
    dependencia_alta: 'Has reducido la dependencia personal',
    dependencia_cliente: 'Has diversificado tu cartera de clientes',
  };
  return texts[trigger] || trigger;
}
