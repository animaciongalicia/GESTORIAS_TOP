'use client';

import { WIZARD_SCREENS } from '@/lib/constants/wizard';

interface WizardProgressProps {
  currentScreen: number;
}

export function WizardProgress({ currentScreen }: WizardProgressProps) {
  const totalScreens = WIZARD_SCREENS.length;
  const progress = ((currentScreen + 1) / totalScreens) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-500 mb-2">
        <span>Paso {currentScreen + 1} de {totalScreens}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
