'use client';

import { WizardQuestion } from '@/types';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: WizardQuestion;
  selectedValue: number | undefined;
  onSelect: (questionId: string, value: number) => void;
}

export function QuestionCard({ question, selectedValue, onSelect }: QuestionCardProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">{question.question}</h3>
      {question.description && (
        <p className="text-sm text-gray-500">{question.description}</p>
      )}
      <div className="space-y-2">
        {question.options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(question.id, option.value)}
            className={cn(
              'w-full text-left p-4 rounded-lg border-2 transition-all',
              selectedValue === option.value
                ? 'border-brand bg-brand/5'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  selectedValue === option.value
                    ? 'border-brand'
                    : 'border-gray-300'
                )}
              >
                {selectedValue === option.value && (
                  <div className="w-3 h-3 rounded-full bg-brand" />
                )}
              </div>
              <span className={cn(
                'text-sm',
                selectedValue === option.value ? 'text-gray-900 font-medium' : 'text-gray-700'
              )}>
                {option.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
