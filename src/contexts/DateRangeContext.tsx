'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Interface pour le contexte de plage de dates
interface DateRangeContextType {
  // Plage de dates principale
  range: string;
  startDate: string;
  endDate: string;
  displayLabel: string;
  
  // Plage de dates de comparaison
  comparisonRange: string | null;
  comparisonStartDate: string | null;
  comparisonEndDate: string | null;
  comparisonDisplayLabel: string | null;
  
  // Méthodes pour mettre à jour les plages
  setDateRange: (range: string, startDate?: string, endDate?: string) => void;
  setComparisonDateRange: (range: string, startDate?: string, endDate?: string) => void;
}

// Valeurs par défaut du contexte
const defaultContext: DateRangeContextType = {
  range: 'thisMonth',
  startDate: '',  // Ces valeurs seraient calculées en fonction de la date actuelle
  endDate: '',    // dans une implémentation complète
  displayLabel: 'Ce mois-ci',
  
  comparisonRange: 'previousYear',
  comparisonStartDate: '',
  comparisonEndDate: '',
  comparisonDisplayLabel: 'Année précédente',
  
  setDateRange: () => {},
  setComparisonDateRange: () => {}
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
  const [range, setRange] = useState('thisMonth');
  const [startDate, setStartDate] = useState('2025-02-01');
  const [endDate, setEndDate] = useState('2025-02-28');
  const [displayLabel, setDisplayLabel] = useState('Ce mois-ci');
  
  // État pour la plage de dates de comparaison
  const [comparisonRange, setComparisonRange] = useState('previousYear');
  const [comparisonStartDate, setComparisonStartDate] = useState('2024-02-01');
  const [comparisonEndDate, setComparisonEndDate] = useState('2024-02-29');
  const [comparisonDisplayLabel, setComparisonDisplayLabel] = useState('Année précédente');

  // Fonction pour mettre à jour la plage de dates principale
  const setDateRange = (newRange: string, newStartDate?: string, newEndDate?: string) => {
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
  };

  // Fonction pour mettre à jour la plage de dates de comparaison
  const setComparisonDateRange = (newRange: string, newStartDate?: string, newEndDate?: string) => {
    setComparisonRange(newRange);
    
    // Si c'est une plage personnalisée, utiliser les dates fournies
    if (newRange === 'custom' && newStartDate && newEndDate) {
      setComparisonStartDate(newStartDate);
      setComparisonEndDate(newEndDate);
      setComparisonDisplayLabel(`${formatDateForDisplay(newStartDate)} - ${formatDateForDisplay(newEndDate)}`);
    } else {
      // Pour les plages prédéfinies, calculer les dates et le libellé
      const { start, end, label } = calculateComparisonDateRange(newRange, { start: startDate, end: endDate });
      setComparisonStartDate(start);
      setComparisonEndDate(end);
      setComparisonDisplayLabel(label);
    }
  };

  // Simulation de formatage de date
  function formatDateForDisplay(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  // Simulation de calcul de plage de dates
  function calculateDateRange(rangeType: string): { start: string, end: string, label: string } {
    // Dans une implémentation réelle, calculer les dates en fonction de rangeType
    // Pour l'exemple, utiliser des valeurs codées en dur
    const ranges: Record<string, { start: string, end: string, label: string }> = {
      today: { start: '2025-03-14', end: '2025-03-14', label: 'Aujourd\'hui' },
      thisWeek: { start: '2025-03-10', end: '2025-03-16', label: 'Cette semaine' },
      thisMonth: { start: '2025-03-01', end: '2025-03-31', label: 'Ce mois-ci' },
      last3Months: { start: '2025-01-01', end: '2025-03-31', label: 'Les 3 derniers mois' },
      last6Months: { start: '2024-10-01', end: '2025-03-31', label: 'Les 6 derniers mois' },
      thisYear: { start: '2025-01-01', end: '2025-12-31', label: 'Cette année' }
    };
    
    return ranges[rangeType] || { start: '2025-01-01', end: '2025-12-31', label: 'Cette année' };
  }

  // Simulation de calcul de plage de dates de comparaison
  function calculateComparisonDateRange(rangeType: string, primaryRange: { start: string, end: string }): { start: string, end: string, label: string } {
    // Dans une implémentation réelle, calculer les dates en fonction de rangeType et primaryRange
    // Pour l'exemple, utiliser des valeurs codées en dur
    const ranges: Record<string, { start: string, end: string, label: string }> = {
      previousYear: { start: '2024-02-01', end: '2024-02-29', label: 'Année précédente' },
      previousPeriod: { start: '2025-01-01', end: '2025-01-31', label: 'Période précédente' },
      sameLastYear: { start: '2024-03-01', end: '2024-03-31', label: 'Même période N-1' },
      sameLastTwoYears: { start: '2023-03-01', end: '2023-03-31', label: 'Même période N-2' }
    };
    
    return ranges[rangeType] || { start: '2024-02-01', end: '2024-02-29', label: 'Année précédente' };
  }

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
        setDateRange,
        setComparisonDateRange
      }}
    >
      {children}
    </DateRangeContext.Provider>
  );
}