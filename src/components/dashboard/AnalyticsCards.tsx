'use client';

import { useMemo } from 'react';
import { Submission, SubmissionGrade, UrgencyLevel, AreaCategory } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GRADE_INFO, AREA_INFO, TRAFFIC_LIGHT_COLORS, getTrafficLight } from '@/lib/utils/scoring';

interface AnalyticsCardsProps {
  submissions: Submission[];
}

interface PeriodStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

interface GradeDistribution {
  A: number;
  B: number;
  C: number;
}

interface UrgencyDistribution {
  high: number;
  medium: number;
  low: number;
}

interface AreaAverages {
  control: number;
  precios: number;
  operaciones: number;
  ventas: number;
}

export function AnalyticsCards({ submissions }: AnalyticsCardsProps) {
  const analytics = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Period stats
    const periodStats: PeriodStats = {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      total: submissions.length,
    };

    // Grade distribution
    const gradeDistribution: GradeDistribution = { A: 0, B: 0, C: 0 };

    // Urgency distribution
    const urgencyDistribution: UrgencyDistribution = { high: 0, medium: 0, low: 0 };

    // Area averages
    const areaAverages: AreaAverages = { control: 0, precios: 0, operaciones: 0, ventas: 0 };
    const areaTotals = { control: 0, precios: 0, operaciones: 0, ventas: 0 };

    // Trigger counts
    const triggerCounts: Record<string, number> = {};

    submissions.forEach((sub) => {
      const createdAt = new Date(sub.created_at);

      // Period counts
      if (createdAt >= startOfDay) periodStats.today++;
      if (createdAt >= startOfWeek) periodStats.thisWeek++;
      if (createdAt >= startOfMonth) periodStats.thisMonth++;

      // Grade distribution
      gradeDistribution[sub.grade]++;

      // Urgency distribution
      urgencyDistribution[sub.urgency]++;

      // Area totals
      areaTotals.control += sub.scores.control;
      areaTotals.precios += sub.scores.precios;
      areaTotals.operaciones += sub.scores.operaciones;
      areaTotals.ventas += sub.scores.ventas;

      // Trigger counts
      (sub.triggers || []).forEach((trigger) => {
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
      });
    });

    // Calculate area averages
    if (submissions.length > 0) {
      areaAverages.control = Math.round(areaTotals.control / submissions.length);
      areaAverages.precios = Math.round(areaTotals.precios / submissions.length);
      areaAverages.operaciones = Math.round(areaTotals.operaciones / submissions.length);
      areaAverages.ventas = Math.round(areaTotals.ventas / submissions.length);
    }

    // Get top triggers
    const topTriggers = Object.entries(triggerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      periodStats,
      gradeDistribution,
      urgencyDistribution,
      areaAverages,
      topTriggers,
    };
  }, [submissions]);

  const triggerLabels: Record<string, string> = {
    caja_no_semanal: 'No revisa caja semanalmente',
    precios_desactualizados: 'Precios desactualizados',
    descuentos_frecuentes: 'Descuentos frecuentes',
    urgencias_constantes: 'Urgencias constantes',
    dependencia_alta: 'Alta dependencia del dueño',
    dependencia_cliente: 'Dependencia de pocos clientes',
  };

  const areas: AreaCategory[] = ['control', 'precios', 'operaciones', 'ventas'];

  return (
    <div className="space-y-6">
      {/* Period Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Hoy</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.periodStats.today}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Esta semana</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.periodStats.thisWeek}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Este mes</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.periodStats.thisMonth}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.periodStats.total}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribución por nota</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(['A', 'B', 'C'] as SubmissionGrade[]).map((grade) => {
              const count = analytics.gradeDistribution[grade];
              const percentage =
                analytics.periodStats.total > 0
                  ? Math.round((count / analytics.periodStats.total) * 100)
                  : 0;
              const info = GRADE_INFO[grade];

              return (
                <div key={grade} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span>{info.emoji}</span>
                      <span className="font-medium">Nota {grade}</span>
                    </span>
                    <span className="text-gray-500">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <Progress value={percentage} color={info.color} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Urgency Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribución por urgencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(['high', 'medium', 'low'] as UrgencyLevel[]).map((urgency) => {
              const count = analytics.urgencyDistribution[urgency];
              const percentage =
                analytics.periodStats.total > 0
                  ? Math.round((count / analytics.periodStats.total) * 100)
                  : 0;
              const labels = { high: 'Alta', medium: 'Media', low: 'Baja' };
              const colors = { high: '#dc2626', medium: '#d97706', low: '#059669' };

              return (
                <div key={urgency} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{labels[urgency]}</span>
                    <span className="text-gray-500">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <Progress value={percentage} color={colors[urgency]} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Area Averages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Puntuación media por área</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {areas.map((area) => {
              const avg = analytics.areaAverages[area];
              const info = AREA_INFO[area];
              const light = getTrafficLight(avg);
              const color = TRAFFIC_LIGHT_COLORS[light];

              return (
                <div key={area} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span>{info.icon}</span>
                      <span className="font-medium">{info.name}</span>
                    </span>
                    <span className="text-gray-500">{avg}%</span>
                  </div>
                  <Progress value={avg} color={color} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Top Triggers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Problemas más comunes</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topTriggers.length === 0 ? (
              <p className="text-sm text-gray-500">No hay datos suficientes</p>
            ) : (
              <div className="space-y-3">
                {analytics.topTriggers.map(([trigger, count], index) => (
                  <div key={trigger} className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {triggerLabels[trigger] || trigger}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-sm text-gray-500">
                      {count} casos
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
