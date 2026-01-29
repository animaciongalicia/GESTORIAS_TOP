'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Submission, UrgencyLevel, SubmissionGrade, AreaCategory } from '@/types';
import { formatDateTime, getGradeColor, getUrgencyColor, getUrgencyLabel } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface SubmissionsListProps {
  submissions: Submission[];
  tenantSlug: string;
}

export function SubmissionsList({ submissions, tenantSlug }: SubmissionsListProps) {
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | 'all'>('all');
  const [gradeFilter, setGradeFilter] = useState<SubmissionGrade | 'all'>('all');
  const [redAreaFilter, setRedAreaFilter] = useState<AreaCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // Urgency filter
      if (urgencyFilter !== 'all' && sub.urgency !== urgencyFilter) {
        return false;
      }

      // Grade filter
      if (gradeFilter !== 'all' && sub.grade !== gradeFilter) {
        return false;
      }

      // Red area filter
      if (redAreaFilter !== 'all') {
        const score = sub.scores[redAreaFilter];
        if (score >= 45) return false; // Not red
      }

      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !sub.company_name.toLowerCase().includes(query) &&
          !(sub.email?.toLowerCase().includes(query))
        ) {
          return false;
        }
      }

      return true;
    });
  }, [submissions, urgencyFilter, gradeFilter, redAreaFilter, searchQuery]);

  const exportToCSV = () => {
    const headers = [
      'Empresa',
      'Sector',
      'Facturación',
      'Empleados',
      'Email',
      'Teléfono',
      'Nota',
      'Urgencia',
      'Control',
      'Precios',
      'Operaciones',
      'Ventas',
      'Total',
      'Solicita ayuda',
      'Fecha',
    ];

    const rows = filteredSubmissions.map((sub) => [
      sub.company_name,
      sub.sector || '',
      sub.revenue_range || '',
      sub.employees_range || '',
      sub.email || '',
      sub.phone || '',
      sub.grade,
      sub.urgency,
      sub.scores.control,
      sub.scores.precios,
      sub.scores.operaciones,
      sub.scores.ventas,
      sub.scores.total,
      sub.opt_in_help ? 'Sí' : 'No',
      new Date(sub.created_at).toISOString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `diagnosticos_${tenantSlug}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const urgencyOptions = [
    { value: 'all', label: 'Todas las urgencias' },
    { value: 'high', label: 'Alta' },
    { value: 'medium', label: 'Media' },
    { value: 'low', label: 'Baja' },
  ];

  const gradeOptions = [
    { value: 'all', label: 'Todas las notas' },
    { value: 'A', label: 'A - Sano' },
    { value: 'B', label: 'B - Mejorable' },
    { value: 'C', label: 'C - Urgente' },
  ];

  const areaOptions = [
    { value: 'all', label: 'Todas las áreas' },
    { value: 'control', label: 'Control en rojo' },
    { value: 'precios', label: 'Precios en rojo' },
    { value: 'operaciones', label: 'Operaciones en rojo' },
    { value: 'ventas', label: 'Ventas en rojo' },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar empresa o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-40">
              <Select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value as UrgencyLevel | 'all')}
                options={urgencyOptions}
              />
            </div>
            <div className="w-40">
              <Select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value as SubmissionGrade | 'all')}
                options={gradeOptions}
              />
            </div>
            <div className="w-48">
              <Select
                value={redAreaFilter}
                onChange={(e) => setRedAreaFilter(e.target.value as AreaCategory | 'all')}
                options={areaOptions}
              />
            </div>
            <Button variant="secondary" onClick={exportToCSV}>
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        Mostrando {filteredSubmissions.length} de {submissions.length} diagnósticos
      </p>

      {/* List */}
      {filteredSubmissions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No hay diagnósticos que coincidan con los filtros.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSubmissions.map((sub) => (
            <Link key={sub.id} href={`/dashboard/submission/${sub.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {sub.company_name}
                        </h3>
                        {sub.opt_in_help && (
                          <Badge variant="info">Solicita ayuda</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {sub.sector} · {sub.revenue_range}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div
                          className="text-2xl font-bold"
                          style={{ color: getGradeColor(sub.grade) }}
                        >
                          {sub.grade}
                        </div>
                        <div className="text-xs text-gray-500">
                          {sub.scores.total}%
                        </div>
                      </div>

                      <div
                        className="px-2 py-1 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: getUrgencyColor(sub.urgency) }}
                      >
                        {getUrgencyLabel(sub.urgency)}
                      </div>

                      <div className="text-gray-400 text-xs whitespace-nowrap">
                        {formatDateTime(sub.created_at)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
