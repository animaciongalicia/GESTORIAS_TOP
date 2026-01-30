import { AreaCategory, SubmissionScores } from '@/types';

// Sector benchmarks based on typical patterns for Spanish SMEs
// These are illustrative values that represent typical averages per sector

export interface SectorBenchmark {
  sector: string;
  scores: Omit<SubmissionScores, 'total'>;
  notes?: string;
}

export const SECTOR_BENCHMARKS: Record<string, SectorBenchmark> = {
  'Hostelería / Restauración': {
    sector: 'Hostelería / Restauración',
    scores: {
      control: 42,
      precios: 38,
      operaciones: 45,
      ventas: 50,
    },
    notes: 'Sector con márgenes ajustados y alta rotación. El control de caja es crítico.',
  },
  'Retail / Comercio': {
    sector: 'Retail / Comercio',
    scores: {
      control: 55,
      precios: 48,
      operaciones: 52,
      ventas: 45,
    },
    notes: 'Competencia intensa en precios. Diferenciación y experiencia de cliente son clave.',
  },
  'Servicios profesionales': {
    sector: 'Servicios profesionales',
    scores: {
      control: 58,
      precios: 52,
      operaciones: 48,
      ventas: 42,
    },
    notes: 'Alta dependencia del profesional. La captación de clientes suele ser el reto principal.',
  },
  'Salud / Bienestar': {
    sector: 'Salud / Bienestar',
    scores: {
      control: 52,
      precios: 55,
      operaciones: 50,
      ventas: 55,
    },
    notes: 'Sector en crecimiento. Buenos márgenes si se gestiona bien la agenda y la fidelización.',
  },
  'Construcción / Reformas': {
    sector: 'Construcción / Reformas',
    scores: {
      control: 40,
      precios: 45,
      operaciones: 38,
      ventas: 48,
    },
    notes: 'Mucha variabilidad en proyectos. Control de costes y gestión de imprevistos críticos.',
  },
  'Automoción': {
    sector: 'Automoción',
    scores: {
      control: 60,
      precios: 50,
      operaciones: 55,
      ventas: 52,
    },
    notes: 'Sector maduro con márgenes definidos. Fidelización y servicios adicionales son diferenciadores.',
  },
  'Tecnología / Digital': {
    sector: 'Tecnología / Digital',
    scores: {
      control: 55,
      precios: 58,
      operaciones: 52,
      ventas: 48,
    },
    notes: 'Alto potencial de escalabilidad. El reto suele ser la captación y retención de clientes.',
  },
  'Industria / Fabricación': {
    sector: 'Industria / Fabricación',
    scores: {
      control: 62,
      precios: 52,
      operaciones: 58,
      ventas: 45,
    },
    notes: 'Necesita inversión y control riguroso. Optimización de procesos es clave.',
  },
  'Transporte / Logística': {
    sector: 'Transporte / Logística',
    scores: {
      control: 50,
      precios: 42,
      operaciones: 55,
      ventas: 50,
    },
    notes: 'Márgenes ajustados por combustible y competencia. Eficiencia operativa es diferenciador.',
  },
  'Educación / Formación': {
    sector: 'Educación / Formación',
    scores: {
      control: 52,
      precios: 55,
      operaciones: 48,
      ventas: 52,
    },
    notes: 'Digitalización abre oportunidades. El marketing de contenidos funciona bien.',
  },
  'Inmobiliaria': {
    sector: 'Inmobiliaria',
    scores: {
      control: 55,
      precios: 60,
      operaciones: 52,
      ventas: 58,
    },
    notes: 'Ingresos variables por comisiones. Red de contactos y reputación son fundamentales.',
  },
  'Agricultura / Ganadería': {
    sector: 'Agricultura / Ganadería',
    scores: {
      control: 45,
      precios: 38,
      operaciones: 50,
      ventas: 35,
    },
    notes: 'Dependencia de factores externos y precios de mercado. Diversificación de canales ayuda.',
  },
  'Peluquería / Estética': {
    sector: 'Peluquería / Estética',
    scores: {
      control: 48,
      precios: 50,
      operaciones: 52,
      ventas: 55,
    },
    notes: 'Alta fidelización posible. El boca a boca es el motor principal de captación.',
  },
  'Otro': {
    sector: 'Otro',
    scores: {
      control: 50,
      precios: 50,
      operaciones: 50,
      ventas: 50,
    },
    notes: 'Media general de todos los sectores.',
  },
};

export function getSectorBenchmark(sector: string | null): SectorBenchmark | null {
  if (!sector) return null;
  return SECTOR_BENCHMARKS[sector] || SECTOR_BENCHMARKS['Otro'];
}

export function compareWithBenchmark(
  userScores: SubmissionScores,
  benchmark: SectorBenchmark
): Record<AreaCategory, { diff: number; label: string }> {
  const areas: AreaCategory[] = ['control', 'precios', 'operaciones', 'ventas'];
  const result: Record<AreaCategory, { diff: number; label: string }> = {} as Record<AreaCategory, { diff: number; label: string }>;

  areas.forEach((area) => {
    const diff = userScores[area] - benchmark.scores[area];
    let label: string;

    if (diff >= 15) {
      label = 'Muy por encima';
    } else if (diff >= 5) {
      label = 'Por encima';
    } else if (diff >= -5) {
      label = 'En la media';
    } else if (diff >= -15) {
      label = 'Por debajo';
    } else {
      label = 'Muy por debajo';
    }

    result[area] = { diff, label };
  });

  return result;
}
