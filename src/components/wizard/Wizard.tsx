'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Tenant, WizardState } from '@/types';
import { WIZARD_SCREENS, WIZARD_QUESTIONS, SECTOR_OPTIONS, REVENUE_RANGE_OPTIONS, EMPLOYEES_RANGE_OPTIONS } from '@/lib/constants/wizard';
import { useWizardPersistence } from '@/hooks/useWizardPersistence';
import { WizardProgress } from './WizardProgress';
import { QuestionCard } from './QuestionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface WizardProps {
  tenant: Tenant;
}

const initialState: WizardState = {
  currentScreen: 0,
  companyInfo: {
    company_name: '',
    sector: '',
    revenue_range: '',
    employees_range: '',
  },
  answers: {},
  contactInfo: {
    email: '',
    phone: '',
  },
};

export function Wizard({ tenant }: WizardProps) {
  const router = useRouter();
  const [state, setState] = useState<WizardState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { loadState, saveState, clearState, hasStoredState } = useWizardPersistence(tenant.slug);

  // Check for stored progress on mount
  useEffect(() => {
    if (hasStoredState()) {
      setShowResumePrompt(true);
    }
    setIsInitialized(true);
  }, [hasStoredState]);

  // Save state changes to localStorage (but not on initial load)
  useEffect(() => {
    if (isInitialized && !showResumePrompt) {
      saveState(state);
    }
  }, [state, saveState, isInitialized, showResumePrompt]);

  const handleResume = useCallback(() => {
    const storedState = loadState();
    if (storedState) {
      setState(storedState);
    }
    setShowResumePrompt(false);
  }, [loadState]);

  const handleStartFresh = useCallback(() => {
    clearState();
    setState(initialState);
    setShowResumePrompt(false);
  }, [clearState]);

  const currentScreenData = WIZARD_SCREENS[state.currentScreen];
  const isFirstScreen = state.currentScreen === 0;
  const isLastScreen = state.currentScreen === WIZARD_SCREENS.length - 1;

  const canProceed = (): boolean => {
    switch (currentScreenData.type) {
      case 'intro':
        return true;
      case 'company-info':
        return (
          state.companyInfo.company_name.trim() !== '' &&
          state.companyInfo.sector !== '' &&
          state.companyInfo.revenue_range !== '' &&
          state.companyInfo.employees_range !== ''
        );
      case 'questions':
      case 'contact':
        const requiredQuestions = currentScreenData.questions || [];
        return requiredQuestions.every((qId) => state.answers[qId] !== undefined);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;

    if (isLastScreen) {
      handleSubmit();
    } else {
      setState((prev) => ({ ...prev, currentScreen: prev.currentScreen + 1 }));
    }
  };

  const handleBack = () => {
    if (!isFirstScreen) {
      setState((prev) => ({ ...prev, currentScreen: prev.currentScreen - 1 }));
    }
  };

  const handleAnswerSelect = (questionId: string, value: number) => {
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: value },
    }));
  };

  const handleCompanyInfoChange = (field: keyof WizardState['companyInfo'], value: string) => {
    setState((prev) => ({
      ...prev,
      companyInfo: { ...prev.companyInfo, [field]: value },
    }));
  };

  const handleContactInfoChange = (field: keyof WizardState['contactInfo'], value: string) => {
    setState((prev) => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, [field]: value },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_slug: tenant.slug,
          company_name: state.companyInfo.company_name,
          sector: state.companyInfo.sector,
          revenue_range: state.companyInfo.revenue_range,
          employees_range: state.companyInfo.employees_range,
          email: state.contactInfo.email || undefined,
          phone: state.contactInfo.phone || undefined,
          answers: state.answers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar el diagnóstico');
      }

      // Clear saved progress after successful submission
      clearState();

      router.push(`/d/${tenant.slug}/result/${data.submission_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setIsSubmitting(false);
    }
  };

  const renderScreenContent = () => {
    switch (currentScreenData.type) {
      case 'intro':
        return (
          <div className="text-center py-8">
            {showResumePrompt && (
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 font-medium mb-3">
                  Tienes un diagnóstico sin terminar
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartFresh}
                  >
                    Empezar de nuevo
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleResume}
                    style={{ backgroundColor: tenant.brand_color }}
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}
            <div className="text-6xl mb-6">📊</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {currentScreenData.title}
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto mb-8">
              {currentScreenData.subtitle}
            </p>
            <div className="text-sm text-gray-500 space-y-2">
              <p>14 preguntas rápidas</p>
              <p>Resultado inmediato</p>
              <p>Sin compromiso</p>
            </div>
          </div>
        );

      case 'company-info':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{currentScreenData.title}</h2>
              {currentScreenData.subtitle && (
                <p className="text-gray-600 mt-2">{currentScreenData.subtitle}</p>
              )}
            </div>
            <Input
              label="Nombre de tu empresa / negocio"
              value={state.companyInfo.company_name}
              onChange={(e) => handleCompanyInfoChange('company_name', e.target.value)}
              placeholder="Ej: Restaurante El Buen Sabor"
            />
            <Select
              label="Sector"
              value={state.companyInfo.sector}
              onChange={(e) => handleCompanyInfoChange('sector', e.target.value)}
              placeholder="Selecciona tu sector"
              options={SECTOR_OPTIONS.map((s) => ({ value: s, label: s }))}
            />
            <Select
              label="Facturación anual aproximada"
              value={state.companyInfo.revenue_range}
              onChange={(e) => handleCompanyInfoChange('revenue_range', e.target.value)}
              placeholder="Selecciona un rango"
              options={REVENUE_RANGE_OPTIONS.map((r) => ({ value: r, label: r }))}
            />
            <Select
              label="Número de empleados"
              value={state.companyInfo.employees_range}
              onChange={(e) => handleCompanyInfoChange('employees_range', e.target.value)}
              placeholder="Selecciona un rango"
              options={EMPLOYEES_RANGE_OPTIONS.map((e) => ({ value: e, label: e }))}
            />
          </div>
        );

      case 'questions':
        const questions = (currentScreenData.questions || [])
          .map((qId) => WIZARD_QUESTIONS.find((q) => q.id === qId))
          .filter(Boolean);

        return (
          <div className="space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{currentScreenData.title}</h2>
              {currentScreenData.subtitle && (
                <p className="text-gray-600 mt-2">{currentScreenData.subtitle}</p>
              )}
            </div>
            {questions.map((question) => (
              <QuestionCard
                key={question!.id}
                question={question!}
                selectedValue={state.answers[question!.id]}
                onSelect={handleAnswerSelect}
              />
            ))}
          </div>
        );

      case 'contact':
        const contactQuestions = (currentScreenData.questions || [])
          .map((qId) => WIZARD_QUESTIONS.find((q) => q.id === qId))
          .filter(Boolean);

        return (
          <div className="space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{currentScreenData.title}</h2>
              {currentScreenData.subtitle && (
                <p className="text-gray-600 mt-2">{currentScreenData.subtitle}</p>
              )}
            </div>
            {contactQuestions.map((question) => (
              <QuestionCard
                key={question!.id}
                question={question!}
                selectedValue={state.answers[question!.id]}
                onSelect={handleAnswerSelect}
              />
            ))}
            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-sm text-gray-600 mb-4">
                Déjanos tu contacto si quieres que te ayudemos (opcional):
              </p>
              <div className="space-y-4">
                <Input
                  label="Email (opcional)"
                  type="email"
                  value={state.contactInfo.email}
                  onChange={(e) => handleContactInfoChange('email', e.target.value)}
                  placeholder="tu@email.com"
                />
                <Input
                  label="Teléfono (opcional)"
                  type="tel"
                  value={state.contactInfo.phone}
                  onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                  placeholder="+34 612 345 678"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with tenant branding */}
      <header
        className="bg-white border-b"
        style={{ borderBottomColor: tenant.brand_color }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <span
              className="font-semibold text-lg"
              style={{ color: tenant.brand_color }}
            >
              {tenant.name}
            </span>
            {!isFirstScreen && (
              <WizardProgress currentScreen={state.currentScreen} />
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 sm:p-8">
            {renderScreenContent()}

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 flex gap-4">
              {!isFirstScreen && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Anterior
                </Button>
              )}
              <Button
                className="flex-1"
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                isLoading={isSubmitting}
                style={{ backgroundColor: tenant.brand_color }}
              >
                {isFirstScreen
                  ? 'Empezar diagnóstico'
                  : isLastScreen
                  ? 'Ver mi resultado'
                  : 'Siguiente'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500">
        Diagnóstico ofrecido por {tenant.name}
      </footer>
    </div>
  );
}
