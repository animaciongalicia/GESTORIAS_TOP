'use client';

import { useState } from 'react';
import { Submission, Tenant, AreaCategory } from '@/types';
import { GRADE_INFO, AREA_INFO, TRAFFIC_LIGHT_COLORS, getTrafficLights, getPriorityLevers, detectTriggers } from '@/lib/utils/scoring';
import { downloadDiagnosticPDF } from '@/lib/utils/pdf';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SectorComparison } from './SectorComparison';
import { cn } from '@/lib/utils';

interface ResultViewProps {
  submission: Submission;
  tenant: Tenant;
}

export function ResultView({ submission, tenant }: ResultViewProps) {
  const [optInRequested, setOptInRequested] = useState(submission.opt_in_help);
  const [isRequesting, setIsRequesting] = useState(false);

  const gradeInfo = GRADE_INFO[submission.grade];
  const trafficLights = getTrafficLights(submission.scores);
  const triggers = submission.triggers || detectTriggers(submission.answers);
  const priorityLevers = getPriorityLevers(submission.scores, triggers, trafficLights);

  const handleOptIn = async () => {
    setIsRequesting(true);
    try {
      await fetch(`/api/submissions/${submission.id}/opt-in`, {
        method: 'POST',
      });
      setOptInRequested(true);
    } catch (error) {
      console.error('Error requesting help:', error);
    }
    setIsRequesting(false);
  };

  const areas: AreaCategory[] = ['control', 'precios', 'operaciones', 'ventas'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="bg-white border-b"
        style={{ borderBottomColor: tenant.brand_color }}
      >
        <div className="max-w-3xl mx-auto px-4 py-4">
          <span
            className="font-semibold text-lg"
            style={{ color: tenant.brand_color }}
          >
            {tenant.name}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Grade Card */}
        <Card>
          <CardContent className="p-8 text-center">
            <div
              className="inline-flex items-center justify-center w-24 h-24 rounded-full text-5xl mb-4"
              style={{ backgroundColor: `${gradeInfo.color}20` }}
            >
              {gradeInfo.emoji}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {gradeInfo.title}
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              {gradeInfo.description}
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <span className="text-5xl font-bold" style={{ color: gradeInfo.color }}>
                {submission.scores.total}
              </span>
              <span className="text-2xl text-gray-400">/100</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {submission.company_name}
            </p>
          </CardContent>
        </Card>

        {/* Traffic Lights */}
        <Card>
          <CardHeader>
            <CardTitle>Semáforo por área</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {areas.map((area) => {
              const areaInfo = AREA_INFO[area];
              const score = submission.scores[area];
              const light = trafficLights[area];

              return (
                <div key={area} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{areaInfo.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{areaInfo.name}</p>
                        <p className="text-xs text-gray-500">{areaInfo.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">
                        {score}%
                      </span>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: TRAFFIC_LIGHT_COLORS[light] }}
                      />
                    </div>
                  </div>
                  <Progress
                    value={score}
                    color={TRAFFIC_LIGHT_COLORS[light]}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Sector Comparison */}
        {submission.sector && (
          <SectorComparison sector={submission.sector} scores={submission.scores} />
        )}

        {/* Priority Levers */}
        {priorityLevers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                {priorityLevers.length === 1 ? 'Tu palanca prioritaria' : `Tus ${priorityLevers.length} palancas prioritarias`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {priorityLevers.map((lever, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-4 rounded-lg border-l-4',
                    index === 0 ? 'bg-red-50 border-red-500' : 'bg-amber-50 border-amber-500'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl font-bold text-gray-300">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{lever.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{lever.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">¿Quieres ayuda para mejorar?</h2>
            <p className="text-gray-300 mb-6">
              Nuestros asesores pueden ayudarte a implementar estas mejoras
            </p>
            {optInRequested ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 text-green-300 rounded-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Solicitud enviada. Te contactaremos pronto.
              </div>
            ) : (
              <Button
                size="lg"
                onClick={handleOptIn}
                isLoading={isRequesting}
                style={{ backgroundColor: tenant.brand_color }}
                className="text-white"
              >
                Solicitar ayuda
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Share / Print / Download */}
        <div className="flex justify-center gap-4 text-sm">
          <button
            onClick={() => downloadDiagnosticPDF(submission, tenant)}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar PDF
          </button>
          <button
            onClick={() => window.print()}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Enlace copiado');
            }}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Compartir
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500">
        Diagnóstico realizado el {new Date(submission.created_at).toLocaleDateString('es-ES')}
        <br />
        Ofrecido por {tenant.name}
      </footer>
    </div>
  );
}
