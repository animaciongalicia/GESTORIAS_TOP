import { describe, it, expect } from 'vitest';
import {
  calculateScores,
  calculateGrade,
  calculateUrgency,
  detectTriggers,
  getTrafficLight,
  calculateFullResult,
} from './scoring';

describe('calculateScores', () => {
  it('should calculate 100% when all answers are 5', () => {
    const answers = {
      q1: 5, q2: 5, q3: 5, q4: 5,   // control
      q5: 5, q6: 5, q7: 5, q8: 5,   // precios
      q9: 5, q10: 5, q11: 5,        // operaciones
      q12: 5, q13: 5, q14: 5,       // ventas
    };
    const scores = calculateScores(answers);

    expect(scores.control).toBe(100);
    expect(scores.precios).toBe(100);
    expect(scores.operaciones).toBe(100);
    expect(scores.ventas).toBe(100);
    expect(scores.total).toBe(100);
  });

  it('should calculate 0% when all answers are 1', () => {
    const answers = {
      q1: 1, q2: 1, q3: 1, q4: 1,
      q5: 1, q6: 1, q7: 1, q8: 1,
      q9: 1, q10: 1, q11: 1,
      q12: 1, q13: 1, q14: 1,
    };
    const scores = calculateScores(answers);

    expect(scores.control).toBe(0);
    expect(scores.precios).toBe(0);
    expect(scores.operaciones).toBe(0);
    expect(scores.ventas).toBe(0);
    expect(scores.total).toBe(0);
  });

  it('should calculate 50% when all answers are 3', () => {
    const answers = {
      q1: 3, q2: 3, q3: 3, q4: 3,
      q5: 3, q6: 3, q7: 3, q8: 3,
      q9: 3, q10: 3, q11: 3,
      q12: 3, q13: 3, q14: 3,
    };
    const scores = calculateScores(answers);

    expect(scores.control).toBe(50);
    expect(scores.precios).toBe(50);
    expect(scores.operaciones).toBe(50);
    expect(scores.ventas).toBe(50);
    expect(scores.total).toBe(50);
  });
});

describe('calculateGrade', () => {
  it('should return A when total >= 75', () => {
    expect(calculateGrade({ control: 75, precios: 75, operaciones: 75, ventas: 75, total: 75 })).toBe('A');
    expect(calculateGrade({ control: 100, precios: 100, operaciones: 100, ventas: 100, total: 100 })).toBe('A');
  });

  it('should return B when total is 45-74', () => {
    expect(calculateGrade({ control: 50, precios: 50, operaciones: 50, ventas: 50, total: 50 })).toBe('B');
    expect(calculateGrade({ control: 45, precios: 45, operaciones: 45, ventas: 45, total: 45 })).toBe('B');
    expect(calculateGrade({ control: 74, precios: 74, operaciones: 74, ventas: 74, total: 74 })).toBe('B');
  });

  it('should return C when total < 45', () => {
    expect(calculateGrade({ control: 40, precios: 40, operaciones: 40, ventas: 40, total: 40 })).toBe('C');
    expect(calculateGrade({ control: 0, precios: 0, operaciones: 0, ventas: 0, total: 0 })).toBe('C');
    expect(calculateGrade({ control: 44, precios: 44, operaciones: 44, ventas: 44, total: 44 })).toBe('C');
  });
});

describe('detectTriggers', () => {
  it('should detect caja_no_semanal trigger when q1 <= 2', () => {
    expect(detectTriggers({ q1: 1 })).toContain('caja_no_semanal');
    expect(detectTriggers({ q1: 2 })).toContain('caja_no_semanal');
    expect(detectTriggers({ q1: 3 })).not.toContain('caja_no_semanal');
  });

  it('should detect precios_desactualizados trigger when q5 <= 2', () => {
    expect(detectTriggers({ q5: 1 })).toContain('precios_desactualizados');
    expect(detectTriggers({ q5: 2 })).toContain('precios_desactualizados');
    expect(detectTriggers({ q5: 3 })).not.toContain('precios_desactualizados');
  });

  it('should detect descuentos_frecuentes trigger when q7 <= 2', () => {
    expect(detectTriggers({ q7: 1 })).toContain('descuentos_frecuentes');
    expect(detectTriggers({ q7: 2 })).toContain('descuentos_frecuentes');
    expect(detectTriggers({ q7: 3 })).not.toContain('descuentos_frecuentes');
  });

  it('should detect urgencias_constantes trigger when q9 <= 2', () => {
    expect(detectTriggers({ q9: 1 })).toContain('urgencias_constantes');
    expect(detectTriggers({ q9: 2 })).toContain('urgencias_constantes');
    expect(detectTriggers({ q9: 3 })).not.toContain('urgencias_constantes');
  });

  it('should detect dependencia_alta trigger when q11 <= 2', () => {
    expect(detectTriggers({ q11: 1 })).toContain('dependencia_alta');
    expect(detectTriggers({ q11: 2 })).toContain('dependencia_alta');
    expect(detectTriggers({ q11: 3 })).not.toContain('dependencia_alta');
  });

  it('should detect multiple triggers', () => {
    const triggers = detectTriggers({ q1: 1, q5: 2, q7: 1, q9: 2, q11: 1, q13: 2 });
    expect(triggers).toContain('caja_no_semanal');
    expect(triggers).toContain('precios_desactualizados');
    expect(triggers).toContain('descuentos_frecuentes');
    expect(triggers).toContain('urgencias_constantes');
    expect(triggers).toContain('dependencia_alta');
    expect(triggers).toContain('dependencia_cliente');
  });
});

describe('calculateUrgency', () => {
  it('should return high when 3+ critical triggers', () => {
    const scores = { control: 60, precios: 60, operaciones: 60, ventas: 60, total: 60 };
    const triggers = ['caja_no_semanal', 'precios_desactualizados', 'urgencias_constantes'];
    expect(calculateUrgency(scores, triggers)).toBe('high');
  });

  it('should return high when total < 45', () => {
    const scores = { control: 40, precios: 40, operaciones: 40, ventas: 40, total: 40 };
    expect(calculateUrgency(scores, [])).toBe('high');
  });

  it('should return high when control < 30', () => {
    const scores = { control: 25, precios: 70, operaciones: 70, ventas: 70, total: 60 };
    expect(calculateUrgency(scores, [])).toBe('high');
  });

  it('should return medium when 1-2 critical triggers', () => {
    const scores = { control: 70, precios: 70, operaciones: 70, ventas: 70, total: 70 };
    const triggers = ['caja_no_semanal'];
    expect(calculateUrgency(scores, triggers)).toBe('medium');
  });

  it('should return low when no triggers and good scores', () => {
    const scores = { control: 80, precios: 80, operaciones: 80, ventas: 80, total: 80 };
    expect(calculateUrgency(scores, [])).toBe('low');
  });
});

describe('getTrafficLight', () => {
  it('should return red when score < 45', () => {
    expect(getTrafficLight(0)).toBe('red');
    expect(getTrafficLight(44)).toBe('red');
  });

  it('should return amber when score is 45-74', () => {
    expect(getTrafficLight(45)).toBe('amber');
    expect(getTrafficLight(74)).toBe('amber');
  });

  it('should return green when score >= 75', () => {
    expect(getTrafficLight(75)).toBe('green');
    expect(getTrafficLight(100)).toBe('green');
  });
});

describe('calculateFullResult', () => {
  it('should return complete result with all fields', () => {
    const answers = {
      q1: 3, q2: 3, q3: 3, q4: 3,
      q5: 3, q6: 3, q7: 3, q8: 3,
      q9: 3, q10: 3, q11: 3,
      q12: 3, q13: 3, q14: 3,
    };

    const result = calculateFullResult(answers);

    expect(result).toHaveProperty('scores');
    expect(result).toHaveProperty('grade');
    expect(result).toHaveProperty('urgency');
    expect(result).toHaveProperty('triggers');
    expect(result).toHaveProperty('trafficLights');
    expect(result).toHaveProperty('priorityLevers');
    expect(result.grade).toBe('B');
    expect(result.scores.total).toBe(50);
  });

  it('should identify priority levers for low scores', () => {
    const answers = {
      q1: 1, q2: 1, q3: 1, q4: 1, // control: very low
      q5: 1, q6: 1, q7: 1, q8: 1, // precios: very low
      q9: 1, q10: 1, q11: 1,      // operaciones: very low
      q12: 1, q13: 1, q14: 1,     // ventas: very low
    };

    const result = calculateFullResult(answers);

    expect(result.grade).toBe('C');
    expect(result.urgency).toBe('high');
    expect(result.priorityLevers.length).toBeGreaterThan(0);
    expect(result.priorityLevers.length).toBeLessThanOrEqual(3);
  });
});
