'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  calculateDateRange, 
  calculateComparisonDateRange, 
  formatDateForDisplay
} from '@/utils/dateUtils';

// Types pour les plages de dates
export type DateRangeType = 'thisMonth' | 'lastMonth' | 'last3Months' | 'last6Months' | 'thisYear' | 'custom';
export type ComparisonRangeType = 'previousYear' | 'previousPeriod' | 'custom' | null;

// Interface pour le contexte de plage de dates
interface DateRangeContextType {
  // Plage de dates principale
  range: DateRangeType;
  startDate: string;
  endDate: string;
  displayLabel: string;
  
  // Plage de dates de comparaison
  comparisonRange: ComparisonRangeType;
  comparisonStartDate: string | null;
  comparisonEndDate: string | null;
  comparisonDisplayLabel: string | null;
  
  // Méthodes pour mettre à jour les plages
  setDateRange: (range: DateRangeType, startDate?: string, endDate?: string) => void;
  setComparisonDateRange: (range: ComparisonRangeType, startDate?: string, endDate?: string) => void;
  
  // Méthode pour désactiver la comparaison
  disableComparison: () => void;
  
  // Méthode pour réinitialiser les plages
  resetToDefaults: () => void;

  // Méthode pour savoir si la comparaison est activée
  isComparisonEnabled: boolean;
}

// Valeurs initiales des plages
const initialRange: DateRangeType = 'thisMonth';
const initialComparisonRange: ComparisonRangeType = 'previousYear';

// Valeurs par défaut du contexte
const defaultContext: DateRangeContextType = {
  range: initialRange,
  startDate: '',
  endDate: '',
  displayLabel: 'Ce mois-ci',
  
  comparisonRange: initialComparisonRange,
  comparisonStartDate: null,
  comparisonEndDate: null,
  comparisonDisplayLabel: 'Année précédente',
  
  setDateRange: () => {},
  setComparisonDateRange: () => {},
  disableComparison: () => {},
  resetToDefaults: () => {},
  isComparisonEnabled: true
};

// Création du contexte
const DateRangeContext = createContext<DateRangeContextType>(defaultContext);

// Hook personnalisé pour utiliser le contexte
export const useDateRange = () => useContext(DateRangeContext);

// Le fournisseur de contexte
interface DateRangeProviderProps {
  children: ReactNode;
}

export function DateRangeProvider({ children }: DateRangeProviderProps) {
  // État pour la plage de dates principale
  const [range, setRange] = useState<DateRangeType>(initialRange);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [displayLabel, setDisplayLabel] = useState<string>('');
  
  // État pour la plage de dates de comparaison
  const [comparisonRange, setComparisonRange] = useState<ComparisonRangeType>(initialComparisonRange);
  const [comparisonStartDate, setComparisonStartDate] = useState<string | null>(null);
  const [comparisonEndDate, setComparisonEndDate] = useState<string | null>(null);
  const [comparisonDisplayLabel, setComparisonDisplayLabel] = useState<string | null>(null);
  const [isComparisonEnabled, setIsComparisonEnabled] = useState<boolean>(true);

  // Initialiser les dates au chargement du composant
  useEffect(() => {
    resetToDefaults();
  }, []);

  // Fonction pour mettre à jour la plage de dates principale
  const updateDateRange = (newRange: DateRangeType, newStartDate?: string, newEndDate?: string) => {
    setRange(newRange);
    
    // Si c'est une plage personnalisée, utiliser les dates fournies
    if (newRange === 'custom' && newStartDate && newEndDate) {
      setStartDate(newStartDate);
      setEndDate(newEndDate);
      setDisplayLabel(`${formatDateForDisplay(newStartDate)} - ${formatDateForDisplay(newEndDate)}`);
    } else {
      // Pour les plages prédéfinies, calculer les dates et le libellé
      const { start, end, label } = calculateDateRange(newRange);
      setStartDate(start);
      setEndDate(end);
      setDisplayLabel(label);
    }

    // Mettre à jour automatiquement la plage de comparaison si elle est activée
    if (isComparisonEnabled && comparisonRange) {
      updateComparisonDateRange(comparisonRange);
    }
  };

  // Fonction pour mettre à jour la plage de dates de comparaison
  const updateComparisonDateRange = (newRange: ComparisonRangeType, newStartDate?: string, newEndDate?: string) => {
    if (newRange === null) {
      setComparisonRange(null);
      setComparisonStartDate(null);
      setComparisonEndDate(null);
      setComparisonDisplayLabel(null);
      setIsComparisonEnabled(false);
      return;
    }

    setComparisonRange(newRange);
    setIsComparisonEnabled(true);
    
    // Si c'est une plage personnalisée, utiliser les dates fournies
    if (newRange === 'custom' && newStartDate && newEndDate) {
      setComparisonStartDate(newStartDate);
      setComparisonEndDate(newEndDate);
      setComparisonDisplayLabel(`${formatDateForDisplay(newStartDate)} - ${formatDateForDisplay(newEndDate)}`);
    } else {
      // Pour les plages prédéfinies, calculer les dates et le libellé
      const comparisonResult = calculateComparisonDateRange(newRange, { start: startDate, end: endDate });
      
      if (comparisonResult) {
        setComparisonStartDate(comparisonResult.start);
        setComparisonEndDate(comparisonResult.end);
        setComparisonDisplayLabel(comparisonResult.label);
      }
    }
  };

  // Fonction pour désactiver la comparaison
  const disableComparison = () => {
    setComparisonRange(null);
    setComparisonStartDate(null);
    setComparisonEndDate(null);
    setComparisonDisplayLabel(null);
    setIsComparisonEnabled(false);
  };

  // Fonction pour réinitialiser aux valeurs par défaut
  const resetToDefaults = () => {
    const { start, end, label } = calculateDateRange(initialRange);
    setRange(initialRange);
    setStartDate(start);
    setEndDate(end);
    setDisplayLabel(label);
    
    const comparisonResult = calculateComparisonDateRange(initialComparisonRange, { start, end });
    if (comparisonResult) {
      setComparisonRange(initialComparisonRange);
      setComparisonStartDate(comparisonResult.start);
      setComparisonEndDate(comparisonResult.end);
      setComparisonDisplayLabel(comparisonResult.label);
      setIsComparisonEnabled(true);
    }
  };

  return (
    <DateRangeContext.Provider
      value={{
        range,
        startDate,
        endDate,
        displayLabel,
        comparisonRange,
        comparisonStartDate,
        comparisonEndDate,
        comparisonDisplayLabel,
        setDateRange: updateDateRange,
        setComparisonDateRange: updateComparisonDateRange,
        disableComparison,
        resetToDefaults,
        isComparisonEnabled
      }}
    >
      {children}
    </DateRangeContext.Provider>
  );
}