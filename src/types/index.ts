// =============================================
// DATABASE TYPES
// =============================================

export type UserRole = 'admin' | 'advisor';
export type SubmissionGrade = 'A' | 'B' | 'C';
export type UrgencyLevel = 'high' | 'medium' | 'low';
export type AreaCategory = 'control' | 'precios' | 'operaciones' | 'ventas';
export type TrafficLight = 'red' | 'amber' | 'green';

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  brand_color: string;
  webhook_url: string | null;
  send_contact_to_make: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  tenant_id: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  tenant_id: string;
  company_name: string;
  sector: string | null;
  revenue_range: string | null;
  employees_range: string | null;
  email: string | null;
  phone: string | null;
  answers: Record<string, number>;
  scores: SubmissionScores;
  grade: SubmissionGrade;
  urgency: UrgencyLevel;
  triggers: string[];
  opt_in_help: boolean;
  created_at: string;
}

export interface SubmissionScores {
  control: number;
  precios: number;
  operaciones: number;
  ventas: number;
  total: number;
}

export interface TenantAggregate {
  tenant_id: string;
  slug: string;
  name: string;
  brand_color: string;
  is_active: boolean;
  total_submissions: number;
  grade_a_count: number;
  grade_b_count: number;
  grade_c_count: number;
  high_urgency_count: number;
  medium_urgency_count: number;
  low_urgency_count: number;
  submissions_last_7_days: number;
  submissions_last_30_days: number;
  tenant_created_at: string;
}

// =============================================
// WIZARD TYPES
// =============================================

export interface WizardQuestion {
  id: string;
  category: AreaCategory;
  question: string;
  description?: string;
  options: WizardOption[];
  trigger?: string;
}

export interface WizardOption {
  value: number;
  label: string;
}

export interface WizardScreen {
  id: number;
  title: string;
  subtitle?: string;
  type: 'intro' | 'company-info' | 'questions' | 'contact' | 'result';
  questions?: string[];
}

export interface WizardState {
  currentScreen: number;
  companyInfo: {
    company_name: string;
    sector: string;
    revenue_range: string;
    employees_range: string;
  };
  answers: Record<string, number>;
  contactInfo: {
    email: string;
    phone: string;
  };
}

// =============================================
// SCORING TYPES
// =============================================

export interface ScoringResult {
  scores: SubmissionScores;
  grade: SubmissionGrade;
  urgency: UrgencyLevel;
  triggers: string[];
  trafficLights: Record<AreaCategory, TrafficLight>;
  priorityLevers: PriorityLever[];
}

export interface PriorityLever {
  area: AreaCategory;
  trigger?: string;
  title: string;
  description: string;
}

// =============================================
// API TYPES
// =============================================

export interface CreateSubmissionPayload {
  tenant_slug: string;
  company_name: string;
  sector: string;
  revenue_range: string;
  employees_range: string;
  email?: string;
  phone?: string;
  answers: Record<string, number>;
}

export interface CreateSubmissionResponse {
  success: boolean;
  submission_id?: string;
  error?: string;
}

// =============================================
// AUTH TYPES
// =============================================

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  tenant_id: string | null;
  tenant?: Tenant | null;
  full_name: string | null;
}

// =============================================
// WEBHOOK TYPES
// =============================================

export interface WebhookPayload {
  tenant_slug: string;
  submission_id: string;
  grade: SubmissionGrade;
  urgency: UrgencyLevel;
  red_areas: AreaCategory[];
  created_at: string;
  email?: string;
  phone?: string;
}
