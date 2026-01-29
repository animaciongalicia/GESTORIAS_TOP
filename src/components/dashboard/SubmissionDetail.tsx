'use client';

import Link from 'next/link';
import { Submission, AreaCategory } from '@/types';
import { WIZARD_QUESTIONS } from '@/lib/constants/wizard';
import { GRADE_INFO, AREA_INFO, TRAFFIC_LIGHT_COLORS, getTrafficLights, getPriorityLevers, detectTriggers } from '@/lib/utils/scoring';
import { formatDateTime, getGradeColor, getUrgencyLabel } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SubmissionDetailProps {
  submission: Submission;
  tenantSlug: string;
}

export function SubmissionDetail({ submission, tenantSlug }: SubmissionDetailProps) {
  const gradeInfo = GRADE_INFO[submission.grade];
  const trafficLights = getTrafficLights(submission.scores);
  const triggers = submission.triggers || detectTriggers(submission.answers);
  const priorityLevers = getPriorityLevers(submission.scores, triggers, trafficLights);

  const areas: AreaCategory[] = ['control', 'precios', 'operaciones', 'ventas'];

  // Group questions by category
  const questionsByCategory = WIZARD_QUESTIONS.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {} as Record<AreaCategory, typeof WIZARD_QUESTIONS>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
                style={{ backgroundColor: `${gradeInfo.color}20` }}
              >
                {gradeInfo.emoji}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-4xl font-bold"
                    style={{ color: getGradeColor(submission.grade) }}
                  >
                    {submission.grade}
                  </span>
                  <span className="text-2xl text-gray-400">
                    {submission.scores.total}/100
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{gradeInfo.title}</p>
                <Badge
                  variant={
                    submission.urgency === 'high'
                      ? 'danger'
                      : submission.urgency === 'medium'
                      ? 'warning'
                      : 'success'
                  }
                  className="mt-2"
                >
                  Urgencia: {getUrgencyLabel(submission.urgency)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scores by area */}
        <Card>
          <CardHeader>
            <CardTitle>Puntuación por área</CardTitle>
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
                      <span>{areaInfo.icon}</span>
                      <span className="font-medium">{areaInfo.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{score}%</span>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: TRAFFIC_LIGHT_COLORS[light] }}
                      />
                    </div>
                  </div>
                  <Progress value={score} color={TRAFFIC_LIGHT_COLORS[light]} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Priority levers */}
        {priorityLevers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Palancas prioritarias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {priorityLevers.map((lever, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-xl font-bold text-gray-300">{index + 1}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{lever.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{lever.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Answers by category */}
        <Card>
          <CardHeader>
            <CardTitle>Respuestas detalladas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {areas.map((area) => {
              const areaInfo = AREA_INFO[area];
              const questions = questionsByCategory[area] || [];

              return (
                <div key={area}>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    {areaInfo.icon} {areaInfo.name}
                  </h4>
                  <div className="space-y-3">
                    {questions.map((q) => {
                      const answer = submission.answers[q.id];
                      const selectedOption = q.options.find((o) => o.value === answer);
                      const isLow = answer <= 2;

                      return (
                        <div
                          key={q.id}
                          className={`p-3 rounded-lg border ${
                            isLow ? 'border-red-200 bg-red-50' : 'border-gray-200'
                          }`}
                        >
                          <p className="text-sm text-gray-700">{q.question}</p>
                          <p className={`text-sm mt-1 font-medium ${isLow ? 'text-red-700' : 'text-gray-900'}`}>
                            → {selectedOption?.label || 'Sin respuesta'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Company info */}
        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-gray-500">Empresa:</span>
              <p className="font-medium">{submission.company_name}</p>
            </div>
            <div>
              <span className="text-gray-500">Sector:</span>
              <p className="font-medium">{submission.sector || '-'}</p>
            </div>
            <div>
              <span className="text-gray-500">Facturación:</span>
              <p className="font-medium">{submission.revenue_range || '-'}</p>
            </div>
            <div>
              <span className="text-gray-500">Empleados:</span>
              <p className="font-medium">{submission.employees_range || '-'}</p>
            </div>
            <div>
              <span className="text-gray-500">Fecha:</span>
              <p className="font-medium">{formatDateTime(submission.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact info */}
        <Card>
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {submission.email ? (
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium">
                  <a href={`mailto:${submission.email}`} className="text-blue-600 hover:underline">
                    {submission.email}
                  </a>
                </p>
              </div>
            ) : (
              <p className="text-gray-400">No dejó email</p>
            )}
            {submission.phone ? (
              <div>
                <span className="text-gray-500">Teléfono:</span>
                <p className="font-medium">
                  <a href={`tel:${submission.phone}`} className="text-blue-600 hover:underline">
                    {submission.phone}
                  </a>
                </p>
              </div>
            ) : (
              <p className="text-gray-400">No dejó teléfono</p>
            )}
            {submission.opt_in_help && (
              <Badge variant="info" className="mt-2">
                Solicita ayuda
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <Link
              href={`/d/${tenantSlug}/result/${submission.id}`}
              target="_blank"
            >
              <Button variant="outline" className="w-full">
                Ver resultado público
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
