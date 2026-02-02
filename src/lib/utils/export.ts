import { Submission } from '@/types';

// CSV Export utility

interface ExportSubmission {
  id: string;
  company_name: string;
  sector: string | null;
  revenue_range: string | null;
  employees_range: string | null;
  email: string | null;
  phone: string | null;
  grade: string;
  urgency: string;
  score_control: number;
  score_precios: number;
  score_operaciones: number;
  score_ventas: number;
  score_total: number;
  triggers: string;
  created_at: string;
}

export function submissionsToCSV(submissions: Submission[]): string {
  const headers = [
    'ID',
    'Empresa',
    'Sector',
    'Facturación',
    'Empleados',
    'Email',
    'Teléfono',
    'Calificación',
    'Urgencia',
    'Control (%)',
    'Precios (%)',
    'Operaciones (%)',
    'Ventas (%)',
    'Total (%)',
    'Problemas detectados',
    'Fecha',
  ];

  const rows = submissions.map((s) => [
    s.id,
    escapeCSV(s.company_name),
    escapeCSV(s.sector || ''),
    escapeCSV(s.revenue_range || ''),
    escapeCSV(s.employees_range || ''),
    escapeCSV(s.email || ''),
    escapeCSV(s.phone || ''),
    s.grade,
    translateUrgency(s.urgency),
    s.scores.control.toString(),
    s.scores.precios.toString(),
    s.scores.operaciones.toString(),
    s.scores.ventas.toString(),
    s.scores.total.toString(),
    escapeCSV(s.triggers.join(', ')),
    formatDate(s.created_at),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function exportSubmissionsToCSV(submissions: Submission[], tenantSlug: string): void {
  const csvContent = submissionsToCSV(submissions);
  const date = new Date().toISOString().split('T')[0];
  const filename = `diagnosticos-${tenantSlug}-${date}.csv`;

  downloadCSV(csvContent, filename);
}

// Helper functions
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function translateUrgency(urgency: string): string {
  const translations: Record<string, string> = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
  };
  return translations[urgency] || urgency;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
