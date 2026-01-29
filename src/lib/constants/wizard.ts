import { WizardQuestion, WizardScreen } from '@/types';

// =============================================
// WIZARD QUESTIONS (14 total, 4 áreas)
// =============================================

export const WIZARD_QUESTIONS: WizardQuestion[] = [
  // CONTROL Y NÚMEROS (4 preguntas)
  {
    id: 'q1',
    category: 'control',
    question: '¿Con qué frecuencia revisas la caja y el banco de tu negocio?',
    options: [
      { value: 1, label: 'Cuando me acuerdo o hay un problema' },
      { value: 2, label: 'Una vez al mes' },
      { value: 3, label: 'Cada 15 días' },
      { value: 4, label: 'Una vez por semana' },
      { value: 5, label: 'Diariamente o casi' },
    ],
    trigger: 'caja_no_semanal',
  },
  {
    id: 'q2',
    category: 'control',
    question: '¿Sabes cuánto dinero te queda libre después de pagar todo (gastos fijos, proveedores, impuestos)?',
    options: [
      { value: 1, label: 'No tengo ni idea' },
      { value: 2, label: 'Más o menos, a ojo' },
      { value: 3, label: 'Lo sé, pero solo al final del año' },
      { value: 4, label: 'Lo calculo cada trimestre' },
      { value: 5, label: 'Lo sé al día, tengo todo controlado' },
    ],
  },
  {
    id: 'q3',
    category: 'control',
    question: '¿Separas claramente el dinero del negocio del tuyo personal?',
    options: [
      { value: 1, label: 'No, uso la misma cuenta para todo' },
      { value: 2, label: 'Intento separarlo pero a veces mezclo' },
      { value: 3, label: 'Tengo cuentas separadas pero no siempre lo cumplo' },
      { value: 4, label: 'Totalmente separado, me pago un sueldo fijo' },
      { value: 5, label: 'Separado + tengo un colchón de emergencia del negocio' },
    ],
  },
  {
    id: 'q4',
    category: 'control',
    question: '¿Cuánto tardas en cobrar de tus clientes (de media)?',
    options: [
      { value: 5, label: 'Cobro al contado o por adelantado' },
      { value: 4, label: 'Menos de 15 días' },
      { value: 3, label: 'Entre 15 y 30 días' },
      { value: 2, label: 'Entre 30 y 60 días' },
      { value: 1, label: 'Más de 60 días, tengo impagados frecuentes' },
    ],
  },

  // PRECIOS Y RENTABILIDAD (4 preguntas)
  {
    id: 'q5',
    category: 'precios',
    question: '¿Cuándo fue la última vez que subiste tus precios?',
    options: [
      { value: 1, label: 'Nunca o hace más de 2 años' },
      { value: 2, label: 'Hace más de 12 meses' },
      { value: 3, label: 'Hace 6-12 meses' },
      { value: 4, label: 'Hace 3-6 meses' },
      { value: 5, label: 'Los reviso regularmente (cada 3-6 meses)' },
    ],
    trigger: 'precios_desactualizados',
  },
  {
    id: 'q6',
    category: 'precios',
    question: '¿Conoces el margen real que ganas con cada servicio o producto?',
    options: [
      { value: 1, label: 'No, pongo precios a ojo o copio a la competencia' },
      { value: 2, label: 'Tengo una idea general, pero no exacta' },
      { value: 3, label: 'Sé el margen de algunos productos/servicios' },
      { value: 4, label: 'Conozco el margen de la mayoría' },
      { value: 5, label: 'Tengo calculado el margen de todo y lo reviso' },
    ],
  },
  {
    id: 'q7',
    category: 'precios',
    question: '¿Con qué frecuencia haces descuentos o regalas cosas?',
    options: [
      { value: 1, label: 'Constantemente, es mi forma de vender' },
      { value: 2, label: 'Bastante a menudo, para cerrar ventas' },
      { value: 3, label: 'De vez en cuando, en promociones puntuales' },
      { value: 4, label: 'Raramente, solo casos muy justificados' },
      { value: 5, label: 'Nunca o casi nunca, mis precios son mis precios' },
    ],
    trigger: 'descuentos_frecuentes',
  },
  {
    id: 'q8',
    category: 'precios',
    question: '¿Tienes claro cuánto te cuesta cada hora de tu tiempo (o de tu equipo)?',
    options: [
      { value: 1, label: 'No, nunca lo he calculado' },
      { value: 2, label: 'Tengo una idea muy vaga' },
      { value: 3, label: 'Lo he calculado alguna vez pero no lo uso' },
      { value: 4, label: 'Lo tengo claro y lo uso para presupuestar' },
      { value: 5, label: 'Lo actualizo regularmente y baso mis precios en ello' },
    ],
  },

  // OPERACIONES Y CAOS (3 preguntas)
  {
    id: 'q9',
    category: 'operaciones',
    question: '¿Cuántas "urgencias" o imprevistos tienes que apagar a la semana?',
    options: [
      { value: 1, label: 'Vivo apagando fuegos, es constante' },
      { value: 2, label: 'Más de 4-5 por semana' },
      { value: 3, label: 'Un par de veces por semana' },
      { value: 4, label: 'Alguna puntual, pero es raro' },
      { value: 5, label: 'Casi nunca, todo está planificado' },
    ],
    trigger: 'urgencias_constantes',
  },
  {
    id: 'q10',
    category: 'operaciones',
    question: '¿Tienes procesos o sistemas documentados para las tareas repetitivas?',
    options: [
      { value: 1, label: 'No, todo está en mi cabeza' },
      { value: 2, label: 'Algunas cosas las tengo apuntadas' },
      { value: 3, label: 'Tengo algunos procesos básicos definidos' },
      { value: 4, label: 'La mayoría de procesos están documentados' },
      { value: 5, label: 'Todo sistematizado, cualquiera puede seguirlo' },
    ],
  },
  {
    id: 'q11',
    category: 'operaciones',
    question: '¿Qué pasaría si mañana no pudieras trabajar durante un mes?',
    options: [
      { value: 1, label: 'El negocio pararía completamente' },
      { value: 2, label: 'Sobreviviría a duras penas, con muchos problemas' },
      { value: 3, label: 'Funcionaría parcialmente, con ayuda' },
      { value: 4, label: 'Seguiría funcionando con algunas dificultades' },
      { value: 5, label: 'Seguiría funcionando sin problema, está todo delegado' },
    ],
    trigger: 'dependencia_alta',
  },

  // VENTAS Y CAPTACIÓN (3 preguntas)
  {
    id: 'q12',
    category: 'ventas',
    question: '¿De dónde vienen tus nuevos clientes?',
    options: [
      { value: 1, label: 'Boca a boca y suerte, no hago nada activo' },
      { value: 2, label: 'Principalmente recomendaciones, algo de redes' },
      { value: 3, label: 'Tengo presencia online pero no estrategia clara' },
      { value: 4, label: 'Combino varios canales con cierta estrategia' },
      { value: 5, label: 'Tengo un sistema de captación medible y predecible' },
    ],
  },
  {
    id: 'q13',
    category: 'ventas',
    question: '¿Qué porcentaje de tu facturación viene de UN solo cliente o sector?',
    options: [
      { value: 1, label: 'Más del 50% de un solo cliente' },
      { value: 2, label: 'Entre 30-50% de un cliente o sector' },
      { value: 3, label: 'Entre 20-30%' },
      { value: 4, label: 'Entre 10-20%' },
      { value: 5, label: 'Ningún cliente supone más del 10%' },
    ],
    trigger: 'dependencia_cliente',
  },
  {
    id: 'q14',
    category: 'ventas',
    question: '¿Mides cuánto te cuesta conseguir un cliente nuevo?',
    options: [
      { value: 1, label: 'No, ni idea de lo que gasto en captar' },
      { value: 2, label: 'Tengo una idea vaga' },
      { value: 3, label: 'Sé más o menos lo que gasto en marketing/ventas' },
      { value: 4, label: 'Tengo el coste calculado aproximadamente' },
      { value: 5, label: 'Lo mido con precisión y optimizo constantemente' },
    ],
  },
];

// =============================================
// WIZARD SCREENS (8 total)
// =============================================

export const WIZARD_SCREENS: WizardScreen[] = [
  {
    id: 0,
    title: 'Diagnóstico de Rentabilidad',
    subtitle: 'Descubre en 5 minutos dónde se te escapa el dinero de tu negocio',
    type: 'intro',
  },
  {
    id: 1,
    title: 'Cuéntanos sobre tu negocio',
    subtitle: 'Información básica para personalizar tu diagnóstico',
    type: 'company-info',
  },
  {
    id: 2,
    title: 'Control y Números',
    subtitle: '¿Tienes el pulso de tu negocio?',
    type: 'questions',
    questions: ['q1', 'q2'],
  },
  {
    id: 3,
    title: 'Control y Números',
    subtitle: 'Seguimos con los números...',
    type: 'questions',
    questions: ['q3', 'q4'],
  },
  {
    id: 4,
    title: 'Precios y Rentabilidad',
    subtitle: '¿Estás cobrando lo que vales?',
    type: 'questions',
    questions: ['q5', 'q6'],
  },
  {
    id: 5,
    title: 'Precios y Rentabilidad',
    subtitle: 'Un poco más sobre precios...',
    type: 'questions',
    questions: ['q7', 'q8'],
  },
  {
    id: 6,
    title: 'Operaciones y Ventas',
    subtitle: '¿Cómo de liso va el día a día?',
    type: 'questions',
    questions: ['q9', 'q10', 'q11'],
  },
  {
    id: 7,
    title: 'Ventas y Contacto',
    subtitle: 'Últimas preguntas y datos de contacto (opcional)',
    type: 'contact',
    questions: ['q12', 'q13', 'q14'],
  },
];

// =============================================
// SELECTS OPTIONS
// =============================================

export const SECTOR_OPTIONS = [
  'Hostelería / Restauración',
  'Retail / Comercio',
  'Servicios profesionales',
  'Salud / Bienestar',
  'Construcción / Reformas',
  'Automoción',
  'Tecnología / Digital',
  'Industria / Fabricación',
  'Transporte / Logística',
  'Educación / Formación',
  'Inmobiliaria',
  'Agricultura / Ganadería',
  'Peluquería / Estética',
  'Otro',
];

export const REVENUE_RANGE_OPTIONS = [
  'Menos de 50.000€',
  '50.000€ - 100.000€',
  '100.000€ - 300.000€',
  '300.000€ - 500.000€',
  '500.000€ - 1M€',
  '1M€ - 3M€',
  'Más de 3M€',
];

export const EMPLOYEES_RANGE_OPTIONS = [
  'Solo yo (autónomo)',
  '1 - 3 empleados',
  '4 - 10 empleados',
  '11 - 25 empleados',
  '26 - 50 empleados',
  'Más de 50 empleados',
];
