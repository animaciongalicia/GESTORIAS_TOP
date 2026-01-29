import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getGradeColor(grade: 'A' | 'B' | 'C'): string {
  switch (grade) {
    case 'A':
      return '#059669';
    case 'B':
      return '#d97706';
    case 'C':
      return '#dc2626';
    default:
      return '#6b7280';
  }
}

export function getUrgencyColor(urgency: 'high' | 'medium' | 'low'): string {
  switch (urgency) {
    case 'high':
      return '#dc2626';
    case 'medium':
      return '#d97706';
    case 'low':
      return '#059669';
    default:
      return '#6b7280';
  }
}

export function getUrgencyLabel(urgency: 'high' | 'medium' | 'low'): string {
  switch (urgency) {
    case 'high':
      return 'Alta';
    case 'medium':
      return 'Media';
    case 'low':
      return 'Baja';
    default:
      return urgency;
  }
}
