'use client';

import { SubmissionScores, AreaCategory } from '@/types';
import { getSectorBenchmark, compareWithBenchmark, SectorBenchmark } from '@/lib/constants/benchmarks';
import { AREA_INFO } from '@/lib/utils/scoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SectorComparisonProps {
  sector: string | null;
  scores: SubmissionScores;
}

export function SectorComparison({ sector, scores }: SectorComparisonProps) {
  const benchmark = getSectorBenchmark(sector);

  if (!benchmark) {
    return null;
  }

  const comparison = compareWithBenchmark(scores, benchmark);
  const areas: AreaCategory[] = ['control', 'precios', 'operaciones', 'ventas'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Comparativa con tu sector</span>
          <span className="text-sm font-normal text-gray-500">
            {sector}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {areas.map((area) => {
            const info = AREA_INFO[area];
            const comp = comparison[area];
            const userScore = scores[area];
            const benchmarkScore = benchmark.scores[area];

            const isPositive = comp.diff > 5;
            const isNegative = comp.diff < -5;

            return (
              <div
                key={area}
                className={cn(
                  'p-3 rounded-lg border',
                  isPositive && 'bg-green-50 border-green-200',
                  isNegative && 'bg-red-50 border-red-200',
                  !isPositive && !isNegative && 'bg-gray-50 border-gray-200'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{info.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{info.name}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-gray-900">{userScore}%</span>
                  <span className="text-xs text-gray-500">vs {benchmarkScore}% sector</span>
                </div>
                <div
                  className={cn(
                    'text-xs font-medium mt-1',
                    isPositive && 'text-green-700',
                    isNegative && 'text-red-700',
                    !isPositive && !isNegative && 'text-gray-600'
                  )}
                >
                  {comp.diff > 0 ? '+' : ''}{comp.diff}pts • {comp.label}
                </div>
              </div>
            );
          })}
        </div>

        {benchmark.notes && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Nota del sector:</span> {benchmark.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
