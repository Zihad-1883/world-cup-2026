'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PredictionMode } from '@/types';
import { useAuth } from './AuthContext';
import { updatePredictionMode } from '@/lib/api';

interface PredictionModeContextType {
  mode: PredictionMode;
  setMode: (mode: PredictionMode) => Promise<void>;
  isLoading: boolean;
}

const PredictionModeContext = createContext<PredictionModeContextType | undefined>(undefined);

export function PredictionModeProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [mode, setModeState] = useState<PredictionMode>('LITE');
  const [isLoading, setIsLoading] = useState(true);

  // Sync mode from user object on load
  useEffect(() => {
    if (user) {
      setModeState(user.predictionMode || 'PRO');
      // If we have a user, clear any guest leftover in localStorage
      localStorage.removeItem('wc2026_prediction_mode');
    } else {
      // Guest mode - load from local storage if exists, otherwise LITE
      const saved = localStorage.getItem('wc2026_prediction_mode');
      setModeState(saved as any || 'LITE');
    }
    setIsLoading(false);
  }, [user]);

  const setMode = useCallback(async (newMode: PredictionMode) => {
    setModeState(newMode);
    
    if (user && token) {
      // Persist to backend
      try {
        await updatePredictionMode(newMode, token);
        localStorage.removeItem('wc2026_prediction_mode'); // Clear guest leftover
      } catch (error) {
        console.error('Failed to update prediction mode on server:', error);
      }
    } else {
      // Guest mode - save to local storage
      localStorage.setItem('wc2026_prediction_mode', newMode);
    }
  }, [user, token]);

  return (
    <PredictionModeContext.Provider value={{ mode, setMode, isLoading }}>
      {children}
    </PredictionModeContext.Provider>
  );
}

export function usePredictionMode() {
  const context = useContext(PredictionModeContext);
  if (context === undefined) {
    throw new Error('usePredictionMode must be used within a PredictionModeProvider');
  }
  return context;
}
