'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DailyData {
  tenant_id: string;
  slug: string;
  name: string;
  submission_date: string;
  completed_count: number;
  grade_a_count: number;
  grade_b_count: number;
  grade_c_count: number;
  high_urgency_count: number;
}

interface EvolutionChartProps {
  data: DailyData[];
  title: string;
  days: number;
}

export function EvolutionChart({ data, title, days }: EvolutionChartProps) {
  const chartData = useMemo(() => {
    // Group by date across all tenants
    const byDate: Record<string, { count: number; gradeA: number; gradeB: number; gradeC: number }> = {};

    // Initialize all dates in range
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      byDate[dateStr] = { count: 0, gradeA: 0, gradeB: 0, gradeC: 0 };
    }

    // Fill in actual data
    data.forEach((item) => {
      const dateStr = item.submission_date.split('T')[0];
      if (byDate[dateStr]) {
        byDate[dateStr].count += Number(item.completed_count);
        byDate[dateStr].gradeA += Number(item.grade_a_count);
        byDate[dateStr].gradeB += Number(item.grade_b_count);
        byDate[dateStr].gradeC += Number(item.grade_c_count);
      }
    });

    // Convert to array
    return Object.entries(byDate)
      .map(([date, values]) => ({
        date,
        ...values,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data, days]);

  const maxCount = useMemo(() => {
    return Math.max(1, ...chartData.map((d) => d.count));
  }, [chartData]);

  const totalSubmissions = useMemo(() => {
    return chartData.reduce((acc, d) => acc + d.count, 0);
  }, [chartData]);

  const chartWidth = 600;
  const chartHeight = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const xScale = (index: number) => padding.left + (index / (chartData.length - 1 || 1)) * innerWidth;
  const yScale = (value: number) => padding.top + innerHeight - (value / maxCount) * innerHeight;

  // Create path for the line
  const linePath = chartData
    .map((d, i) => {
      const x = xScale(i);
      const y = yScale(d.count);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Create path for the area fill
  const areaPath = `${linePath} L ${xScale(chartData.length - 1)} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z`;

  // Y-axis labels
  const yTicks = [0, Math.round(maxCount / 2), maxCount];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <span className="text-2xl font-bold text-gray-900">{totalSubmissions}</span>
        </div>
      </CardHeader>
      <CardContent>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-48"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={yScale(tick)}
                x2={chartWidth - padding.right}
                y2={yScale(tick)}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
              <text
                x={padding.left - 8}
                y={yScale(tick)}
                textAnchor="end"
                alignmentBaseline="middle"
                className="text-xs fill-gray-500"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#gradient)" opacity={0.3} />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Line */}
          <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth={2} />

          {/* Data points */}
          {chartData.map((d, i) => (
            <g key={d.date}>
              <circle
                cx={xScale(i)}
                cy={yScale(d.count)}
                r={3}
                fill="#3b82f6"
                className="cursor-pointer hover:r-5"
              >
                <title>
                  {new Date(d.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}: {d.count} diagnósticos
                </title>
              </circle>
            </g>
          ))}

          {/* X-axis labels (every 7 days) */}
          {chartData
            .filter((_, i) => i % 7 === 0 || i === chartData.length - 1)
            .map((d, idx, arr) => {
              const originalIndex = idx === arr.length - 1 ? chartData.length - 1 : idx * 7;
              return (
                <text
                  key={d.date}
                  x={xScale(originalIndex)}
                  y={chartHeight - 5}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {new Date(d.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </text>
              );
            })}
        </svg>

        {/* Legend - Grade distribution for the period */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600">
              Nota A: {chartData.reduce((acc, d) => acc + d.gradeA, 0)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-gray-600">
              Nota B: {chartData.reduce((acc, d) => acc + d.gradeB, 0)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600">
              Nota C: {chartData.reduce((acc, d) => acc + d.gradeC, 0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
