'use client';

import React, { useState, useEffect } from 'react';
import { PeriodOption } from './PeriodOption';
import { CustomDateRange } from './CustomDateRange';
import { useDateRange, ComparisonRangeType } from '@/contexts/DateRangeContext';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { COMPARISON_OPTIONS } from './date-constants';

export function ComparisonSelector() {
  const { 
    comparisonRange, 
    comparisonStartDate, 
    comparisonEndDate, 
    setComparisonDateRange
  } = useDateRange();
  
  const [selectedPeriod, setSelectedPeriod] = useState<ComparisonRangeType>(
    comparisonRange || 'previousYear'
  );
  const [customStartDate, setCustomStartDate] = useState(comparisonStartDate || '');
  const [customEndDate, setCustomEndDate] = useState(comparisonEndDate || '');
  
  // Synchroniser l'état local avec le contexte
  useEffect(() => {
    if (comparisonRange) {
      setSelectedPeriod(comparisonRange);
    }
    if (comparisonStartDate) {
      setCustomStartDate(comparisonStartDate);
    }
    if (comparisonEndDate) {
      setCustomEndDate(comparisonEndDate);
    }
  }, [comparisonRange, comparisonStartDate, comparisonEndDate]);
  
  // Mettre à jour le contexte lorsqu'une option est sélectionnée
  const handlePeriodSelect = (value: string) => {
    const periodType = value as ComparisonRangeType;
    setSelectedPeriod(periodType);
    
    if (periodType === 'custom') {
      // Pour une période personnalisée, attendre les dates personnalisées
      return;
    }
    
    // Pour les périodes prédéfinies, mettre à jour immédiatement
    setComparisonDateRange(periodType);
  };
  
  // Mettre à jour la date de début personnalisée
  const handleStartDateChange = (date: string) => {
    setCustomStartDate(date);
    if (selectedPeriod === 'custom') {
      setComparisonDateRange('custom', date, customEndDate);
    }
  };
  
  // Mettre à jour la date de fin personnalisée
  const handleEndDateChange = (date: string) => {
    setCustomEndDate(date);
    if (selectedPeriod === 'custom') {
      setComparisonDateRange('custom', customStartDate, date);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {COMPARISON_OPTIONS.map((period) => (
          <PeriodOption 
            key={period.value}
            label={period.label}
            isSelected={selectedPeriod === period.value}
            onClick={() => handlePeriodSelect(period.value)}
          />
        ))}
      </div>
      
      {selectedPeriod === 'custom' ? (
        <CustomDateRange 
          startDate={customStartDate}
          endDate={customEndDate}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
        />
      ) : (
        <div className="flex items-center mt-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <span className="mr-2">Période calculée :</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {comparisonStartDate && comparisonEndDate ? (
              `${formatDateForDisplay(comparisonStartDate)} - ${formatDateForDisplay(comparisonEndDate)}`
            ) : (
              '01/03/2024 - 31/03/2024'
            )}
          </span>
        </div>
      )}
    </div>
  );
}