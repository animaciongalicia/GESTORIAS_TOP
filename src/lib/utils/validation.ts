import { WIZARD_QUESTIONS } from '@/lib/constants/wizard';

// All question IDs that must be present
const REQUIRED_QUESTION_IDS = WIZARD_QUESTIONS.map((q) => q.id);

// Valid answer values
const VALID_VALUES = [1, 2, 3, 4, 5];

export interface ValidationResult {
  valid: boolean;
  error?: string;
  missingQuestions?: string[];
  invalidValues?: { questionId: string; value: unknown }[];
}

/**
 * Validates that answers object contains all required questions with valid values
 */
export function validateAnswers(answers: unknown): ValidationResult {
  // Check it's an object
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    return {
      valid: false,
      error: 'answers must be an object',
    };
  }

  const answersObj = answers as Record<string, unknown>;

  // Check all required questions are present
  const missingQuestions = REQUIRED_QUESTION_IDS.filter(
    (qId) => !(qId in answersObj)
  );

  if (missingQuestions.length > 0) {
    return {
      valid: false,
      error: `Missing answers for questions: ${missingQuestions.join(', ')}`,
      missingQuestions,
    };
  }

  // Check all values are valid (1-5)
  const invalidValues: { questionId: string; value: unknown }[] = [];

  for (const qId of REQUIRED_QUESTION_IDS) {
    const value = answersObj[qId];

    if (typeof value !== 'number' || !VALID_VALUES.includes(value)) {
      invalidValues.push({ questionId: qId, value });
    }
  }

  if (invalidValues.length > 0) {
    return {
      valid: false,
      error: `Invalid values for questions: ${invalidValues.map((v) => `${v.questionId}=${v.value}`).join(', ')}. Values must be 1-5.`,
      invalidValues,
    };
  }

  return { valid: true };
}

/**
 * Validates email format (basic)
 */
export function validateEmail(email: string): boolean {
  if (!email) return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone format (basic - allows international formats)
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return true; // Optional field
  // Allow digits, spaces, dashes, parentheses, and + for international
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 9;
}

/**
 * Sanitize string input (trim and limit length)
 */
export function sanitizeString(input: string, maxLength: number = 255): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}
