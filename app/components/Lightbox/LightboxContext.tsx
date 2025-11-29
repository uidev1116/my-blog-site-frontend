'use client';

import { createContext, useContext } from 'react';

interface LightboxContextType {
  openLightbox: (index: number) => void;
}

const LightboxContext = createContext<LightboxContextType | null>(null);

export function useLightbox() {
  const context = useContext(LightboxContext);
  if (!context) {
    throw new Error('useLightbox must be used within a LightboxProvider');
  }
  return context;
}

export { LightboxContext };
