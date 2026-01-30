'use client';

import { useEffect, useCallback } from 'react';
import { WizardState } from '@/types';

const STORAGE_KEY_PREFIX = 'wizard_progress_';
const STORAGE_EXPIRY_HOURS = 24;

interface StoredWizardData {
  state: WizardState;
  timestamp: number;
  tenantSlug: string;
}

export function useWizardPersistence(tenantSlug: string) {
  const storageKey = `${STORAGE_KEY_PREFIX}${tenantSlug}`;

  const loadState = useCallback((): WizardState | null => {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const data: StoredWizardData = JSON.parse(stored);

      // Check if data is expired
      const hoursElapsed = (Date.now() - data.timestamp) / (1000 * 60 * 60);
      if (hoursElapsed > STORAGE_EXPIRY_HOURS) {
        localStorage.removeItem(storageKey);
        return null;
      }

      // Verify it's for the correct tenant
      if (data.tenantSlug !== tenantSlug) {
        return null;
      }

      return data.state;
    } catch {
      // If parsing fails, remove corrupted data
      localStorage.removeItem(storageKey);
      return null;
    }
  }, [storageKey, tenantSlug]);

  const saveState = useCallback(
    (state: WizardState) => {
      if (typeof window === 'undefined') return;

      try {
        const data: StoredWizardData = {
          state,
          timestamp: Date.now(),
          tenantSlug,
        };
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch {
        // Storage might be full or unavailable
        console.warn('Failed to save wizard progress to localStorage');
      }
    },
    [storageKey, tenantSlug]
  );

  const clearState = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const hasStoredState = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return loadState() !== null;
  }, [loadState]);

  return {
    loadState,
    saveState,
    clearState,
    hasStoredState,
  };
}
