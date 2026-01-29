import {
  SubmissionGrade,
  UrgencyLevel,
  SubmissionScores,
  AreaCategory,
  TrafficLight,
  ScoringResult,
  PriorityLever,
} from '@/types';
import { WIZARD_QUESTIONS } from '@/lib/constants/wizard';

// =============================================
// SCORING CALCULATION
// =============================================

export function calculateScores(answers: Record<string, number>): SubmissionScores {
  const categories: Record<AreaCategory, { total: number; count: number }> = {
    control: { total: 0, count: 0 },
    precios: { total: 0, count: 0 },
    operaciones: { total: 0, count: 0 },
    ventas: { total: 0, count: 0 },
  };

  // Group answers by category
  WIZARD_QUESTIONS.forEach((question) => {
    const answer = answers[question.id];
    if (answer !== undefined) {
      categories[question.category].total += answer;
      categories[question.category].count += 1;
    }
  });

  // Calculate percentage scores (1-5 scale -> 0-100%)
  const calculatePercentage = (total: number, count: number): number => {
    if (count === 0) return 0;
    const average = total / count;
    return Math.round(((average - 1) / 4) * 100);
  };

  const control = calculatePercentage(categories.control.total, categories.control.count);
  const precios = calculatePercentage(categories.precios.total, categories.precios.count);
  const operaciones = calculatePercentage(categories.operaciones.total, categories.operaciones.count);
  const ventas = calculatePercentage(categories.ventas.total, categories.ventas.count);

  // Total is weighted average (all equal weight for now)
  const total = Math.round((control + precios + operaciones + ventas) / 4);

  return { control, precios, operaciones, ventas, total };
}

// =============================================
// GRADE CALCULATION (A>=75, B=45-74, C<45)
// =============================================

export function calculateGrade(scores: SubmissionScores): SubmissionGrade {
  const { total } = scores;

  if (total >= 75) return 'A';
  if (total >= 45) return 'B';
  return 'C';
}

// =============================================
// TRIGGERS DETECTION
// =============================================

export function detectTriggers(answers: Record<string, number>): string[] {
  const triggers: string[] = [];

  WIZARD_QUESTIONS.forEach((question) => {
    const answer = answers[question.id];
    if (question.trigger && answer !== undefined && answer <= 2) {
      triggers.push(question.trigger);
    }
  });

  return triggers;
}

// =============================================
// URGENCY CALCULATION (based on triggers)
// =============================================

export function calculateUrgency(
  scores: SubmissionScores,
  triggers: string[]
): UrgencyLevel {
  // High urgency triggers
  const highTriggers = [
    'caja_no_semanal',
    'precios_desactualizados',
    'urgencias_constantes',
    'descuentos_frecuentes',
    'dependencia_alta',
  ];

  const criticalTriggerCount = triggers.filter((t) =>
    highTriggers.includes(t)
  ).length;

  // High urgency if:
  // - 3+ critical triggers
  // - Score is grade C (<45)
  // - Any area below 30
  if (
    criticalTriggerCount >= 3 ||
    scores.total < 45 ||
    scores.control < 30 ||
    scores.precios < 30
  ) {
    return 'high';
  }

  // Medium urgency if:
  // - 1-2 critical triggers
  // - Score is grade B (45-74)
  // - Any area below 45
  if (
    criticalTriggerCount >= 1 ||
    scores.total < 60 ||
    Object.values(scores).some((s) => s < 45)
  ) {
    return 'medium';
  }

  return 'low';
}

// =============================================
// TRAFFIC LIGHTS (red < 45, amber 45-74, green >= 75)
// =============================================

export function getTrafficLight(score: number): TrafficLight {
  if (score < 45) return 'red';
  if (score < 75) return 'amber';
  return 'green';
}

export function getTrafficLights(
  scores: SubmissionScores
): Record<AreaCategory, TrafficLight> {
  return {
    control: getTrafficLight(scores.control),
    precios: getTrafficLight(scores.precios),
    operaciones: getTrafficLight(scores.operaciones),
    ventas: getTrafficLight(scores.ventas),
  };
}

// =============================================
// PRIORITY LEVERS (max 3)
// =============================================

const LEVER_TEXTS: Record<string, { title: string; description: string }> = {
  // Trigger-based levers
  caja_no_semanal: {
    title: 'Revisa la caja cada semana',
    description:
      'Sin control semanal de caja, los problemas se descubren tarde. Pon una alarma cada viernes para revisar entradas, salidas y saldo.',
  },
  precios_desactualizados: {
    title: 'Sube precios YA',
    description:
      'Llevas más de un año sin subir precios mientras tus costes han subido. Calcula tu coste hora real y ajusta tarifas.',
  },
  descuentos_frecuentes: {
    title: 'Para de regalar tu trabajo',
    description:
      'Los descuentos constantes destruyen tu margen. Aprende a decir que no o busca clientes que valoren lo que haces.',
  },
  urgencias_constantes: {
    title: 'Sal del modo bombero',
    description:
      'Si vives apagando fuegos, el negocio te controla a ti. Documenta procesos y delega. No puedes crecer así.',
  },
  dependencia_alta: {
    title: 'El negocio no puede depender solo de ti',
    description:
      'Si tú paras, todo para. Eso no es un negocio, es un autoempleo frágil. Empieza a delegar y documentar.',
  },
  dependencia_cliente: {
    title: 'Diversifica tu cartera de clientes',
    description:
      'Si un cliente representa más del 30% de tu facturación, estás en riesgo. Si se va, te hunde.',
  },
  // Area-based levers (when area is red but no specific trigger)
  control_red: {
    title: 'Pon orden en los números',
    description:
      'No sabes cuánto ganas ni cuánto gastas realmente. Antes de cualquier otra cosa, necesitas un control básico de caja y costes.',
  },
  precios_red: {
    title: 'Replantea tu política de precios',
    description:
      'Tus precios probablemente no cubren todos tus costes. Calcula tu coste hora real (incluyendo impuestos, alquiler, tu tiempo) y compara.',
  },
  operaciones_red: {
    title: 'Sistematiza tu día a día',
    description:
      'El caos operativo te come tiempo y dinero. Empieza documentando las 3 tareas que más se repiten.',
  },
  ventas_red: {
    title: 'Activa la captación de clientes',
    description:
      'Depender del boca a boca es arriesgado. Define al menos un canal activo de captación que puedas medir.',
  },
};

export function getPriorityLevers(
  scores: SubmissionScores,
  triggers: string[],
  trafficLights: Record<AreaCategory, TrafficLight>
): PriorityLever[] {
  const levers: PriorityLever[] = [];

  // First, add trigger-based levers (highest priority)
  const triggerPriority = [
    'caja_no_semanal',
    'precios_desactualizados',
    'urgencias_constantes',
    'descuentos_frecuentes',
    'dependencia_alta',
    'dependencia_cliente',
  ];

  for (const trigger of triggerPriority) {
    if (triggers.includes(trigger) && levers.length < 3) {
      const text = LEVER_TEXTS[trigger];
      const question = WIZARD_QUESTIONS.find((q) => q.trigger === trigger);
      levers.push({
        area: question?.category || 'control',
        trigger,
        title: text.title,
        description: text.description,
      });
    }
  }

  // Then, add area-based levers for red areas
  const areaOrder: AreaCategory[] = ['control', 'precios', 'operaciones', 'ventas'];

  for (const area of areaOrder) {
    if (trafficLights[area] === 'red' && levers.length < 3) {
      // Check if we already have a lever for this area
      if (!levers.some((l) => l.area === area)) {
        const text = LEVER_TEXTS[`${area}_red`];
        levers.push({
          area,
          title: text.title,
          description: text.description,
        });
      }
    }
  }

  return levers.slice(0, 3);
}

// =============================================
// FULL SCORING RESULT
// =============================================

export function calculateFullResult(
  answers: Record<string, number>
): ScoringResult {
  const scores = calculateScores(answers);
  const grade = calculateGrade(scores);
  const triggers = detectTriggers(answers);
  const urgency = calculateUrgency(scores, triggers);
  const trafficLights = getTrafficLights(scores);
  const priorityLevers = getPriorityLevers(scores, triggers, trafficLights);

  return {
    scores,
    grade,
    urgency,
    triggers,
    trafficLights,
    priorityLevers,
  };
}

// =============================================
// GRADE DESCRIPTIONS
// =============================================

export const GRADE_INFO = {
  A: {
    title: 'Tu negocio está sano',
    description:
      'Tienes buen control de tu negocio. Hay margen de optimización, pero las bases están bien.',
    color: '#059669',
    emoji: '🟢',
  },
  B: {
    title: 'Hay trabajo que hacer',
    description:
      'Tu negocio funciona, pero hay fugas de dinero y tiempo que puedes tapar. Revisa las áreas en ámbar y rojo.',
    color: '#d97706',
    emoji: '🟡',
  },
  C: {
    title: 'Necesitas actuar ya',
    description:
      'Hay varios problemas serios que están costándote dinero cada mes. No lo dejes pasar más.',
    color: '#dc2626',
    emoji: '🔴',
  },
};

// =============================================
// AREA INFO
// =============================================

export const AREA_INFO: Record<
  AreaCategory,
  { name: string; icon: string; description: string }
> = {
  control: {
    name: 'Control y Números',
    icon: '📊',
    description: 'Caja, cobros, separación personal/negocio',
  },
  precios: {
    name: 'Precios y Rentabilidad',
    icon: '💰',
    description: 'Márgenes, tarifas, coste hora',
  },
  operaciones: {
    name: 'Operaciones',
    icon: '⚙️',
    description: 'Procesos, urgencias, dependencia',
  },
  ventas: {
    name: 'Ventas y Captación',
    icon: '📈',
    description: 'Fuentes de clientes, diversificación',
  },
};

// =============================================
// TRAFFIC LIGHT COLORS
// =============================================

export const TRAFFIC_LIGHT_COLORS: Record<TrafficLight, string> = {
  red: '#dc2626',
  amber: '#d97706',
  green: '#059669',
};
