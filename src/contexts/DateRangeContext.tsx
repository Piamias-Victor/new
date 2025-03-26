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
  
  // Valeurs temporaires avant validation
  tempRange: DateRangeType;
  tempStartDate: string;
  tempEndDate: string;
  tempComparisonRange: ComparisonRangeType;
  tempComparisonStartDate: string | null;
  tempComparisonEndDate: string | null;
  
  // Méthode pour appliquer les changements temporaires
  applyChanges: () => void;
  
  // Méthodes pour mettre à jour les valeurs temporaires
  setTempDateRange: (range: DateRangeType, startDate?: string, endDate?: string) => void;
  setTempComparisonDateRange: (range: ComparisonRangeType, startDate?: string, endDate?: string) => void;
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
  isComparisonEnabled: true,
  
  tempRange: initialRange,
  tempStartDate: '',
  tempEndDate: '',
  tempComparisonRange: initialComparisonRange,
  tempComparisonStartDate: null,
  tempComparisonEndDate: null,
  
  applyChanges: () => {},
  setTempDateRange: () => {},
  setTempComparisonDateRange: () => {}
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

  // Nouveaux états pour les valeurs temporaires
  const [tempRange, setTempRange] = useState<DateRangeType>(initialRange);
  const [tempStartDate, setTempStartDate] = useState<string>('');
  const [tempEndDate, setTempEndDate] = useState<string>('');
  const [tempComparisonRange, setTempComparisonRange] = useState<ComparisonRangeType>(initialComparisonRange);
  const [tempComparisonStartDate, setTempComparisonStartDate] = useState<string | null>(null);
  const [tempComparisonEndDate, setTempComparisonEndDate] = useState<string | null>(null);

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
      // Si c'est une plage personnalisée de comparaison, ne pas la mettre à jour automatiquement
      if (comparisonRange !== 'custom') {
        updateComparisonDateRange(comparisonRange);
      }
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
    
    // Mettre aussi à jour les valeurs temporaires
    setTempComparisonRange(null);
    setTempComparisonStartDate(null);
    setTempComparisonEndDate(null);
  };

  // Fonction pour réinitialiser aux valeurs par défaut
  const resetToDefaults = () => {
    const { start, end, label } = calculateDateRange(initialRange);
    // Valeurs réelles
    setRange(initialRange);
    setStartDate(start);
    setEndDate(end);
    setDisplayLabel(label);
    
    // Valeurs temporaires
    setTempRange(initialRange);
    setTempStartDate(start);
    setTempEndDate(end);
    
    const comparisonResult = calculateComparisonDateRange(initialComparisonRange, { start, end });
    if (comparisonResult) {
      // Valeurs réelles
      setComparisonRange(initialComparisonRange);
      setComparisonStartDate(comparisonResult.start);
      setComparisonEndDate(comparisonResult.end);
      setComparisonDisplayLabel(comparisonResult.label);
      
      // Valeurs temporaires
      setTempComparisonRange(initialComparisonRange);
      setTempComparisonStartDate(comparisonResult.start);
      setTempComparisonEndDate(comparisonResult.end);
      
      setIsComparisonEnabled(true);
    }
  };
  
  // Fonction pour mettre à jour temporairement la plage de dates principale
  const updateTempDateRange = (newRange: DateRangeType, newStartDate?: string, newEndDate?: string) => {
    setTempRange(newRange);
    
    // Si c'est une plage personnalisée, utiliser les dates fournies
    if (newRange === 'custom' && newStartDate && newEndDate) {
      setTempStartDate(newStartDate);
      setTempEndDate(newEndDate);
    } else {
      // Pour les plages prédéfinies, calculer les dates
      const { start, end } = calculateDateRange(newRange);
      setTempStartDate(start);
      setTempEndDate(end);
    }
    
    // Mettre à jour la comparaison temporaire si ce n'est pas une plage personnalisée
    if (tempComparisonRange && tempComparisonRange !== 'custom') {
      const newTempData = calculateDateRange(newRange);
      const comparisonResult = calculateComparisonDateRange(tempComparisonRange, { 
        start: newTempData.start, 
        end: newTempData.end 
      });
      
      if (comparisonResult) {
        setTempComparisonStartDate(comparisonResult.start);
        setTempComparisonEndDate(comparisonResult.end);
      }
    }
  };
  
  // Fonction pour mettre à jour temporairement la plage de comparaison
  const updateTempComparisonDateRange = (newRange: ComparisonRangeType, newStartDate?: string, newEndDate?: string) => {
    setTempComparisonRange(newRange);
    
    if (newRange === null) {
      setTempComparisonStartDate(null);
      setTempComparisonEndDate(null);
      return;
    }
    
    if (newRange === 'custom' && newStartDate && newEndDate) {
      setTempComparisonStartDate(newStartDate);
      setTempComparisonEndDate(newEndDate);
    } else {
      const comparisonResult = calculateComparisonDateRange(newRange, { start: tempStartDate, end: tempEndDate });
      
      if (comparisonResult) {
        setTempComparisonStartDate(comparisonResult.start);
        setTempComparisonEndDate(comparisonResult.end);
      }
    }
  };
  
  // Fonction pour appliquer les changements temporaires
  const applyChanges = () => {
    // Mettre à jour la plage principale
    setRange(tempRange);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    
    // Calculer le label d'affichage
    if (tempRange === 'custom') {
      setDisplayLabel(`${formatDateForDisplay(tempStartDate)} - ${formatDateForDisplay(tempEndDate)}`);
    } else {
      const { label } = calculateDateRange(tempRange);
      setDisplayLabel(label);
    }
    
    // Mettre à jour la comparaison
    setComparisonRange(tempComparisonRange);
    setComparisonStartDate(tempComparisonStartDate);
    setComparisonEndDate(tempComparisonEndDate);
    
    // Mettre à jour le label d'affichage de comparaison
    if (tempComparisonRange === 'custom' && tempComparisonStartDate && tempComparisonEndDate) {
      setComparisonDisplayLabel(`${formatDateForDisplay(tempComparisonStartDate)} - ${formatDateForDisplay(tempComparisonEndDate)}`);
    } else if (tempComparisonRange) {
      const comparisonResult = calculateComparisonDateRange(tempComparisonRange, { start: tempStartDate, end: tempEndDate });
      if (comparisonResult) {
        setComparisonDisplayLabel(comparisonResult.label);
      }
    } else {
      setComparisonDisplayLabel(null);
    }
    
    // Mettre à jour si la comparaison est activée
    setIsComparisonEnabled(tempComparisonRange !== null);
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
        isComparisonEnabled,
        
        // Nouvelles valeurs
        tempRange,
        tempStartDate,
        tempEndDate,
        tempComparisonRange,
        tempComparisonStartDate,
        tempComparisonEndDate,
        setTempDateRange: updateTempDateRange,
        setTempComparisonDateRange: updateTempComparisonDateRange,
        applyChanges
      }}
    >
      {children}
    </DateRangeContext.Provider>
  );
}