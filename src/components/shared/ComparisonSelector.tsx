'use client';

import React from 'react';
import { PeriodOption } from './PeriodOption';
import { CustomDateRange } from './CustomDateRange';
import { useDateRange, ComparisonRangeType } from '@/contexts/DateRangeContext';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { COMPARISON_OPTIONS } from './date-constants';

export function ComparisonSelector() {
  const { 
    tempComparisonRange, 
    tempComparisonStartDate, 
    tempComparisonEndDate, 
    setTempComparisonDateRange
  } = useDateRange();
  
  // Utiliser directement les valeurs du contexte sans état local supplémentaire
  
  // Mettre à jour le contexte temporaire lorsqu'une option est sélectionnée
  const handlePeriodSelect = (value: string) => {
    const periodType = value as ComparisonRangeType;
    
    if (periodType !== 'custom') {
      // Pour les périodes prédéfinies, mettre à jour immédiatement
      setTempComparisonDateRange(periodType);
    } else {
      // Pour custom, définir le type mais conserver les dates actuelles
      setTempComparisonDateRange('custom', tempComparisonStartDate || '', tempComparisonEndDate || '');
    }
  };
  
  // Mettre à jour la date de début personnalisée
  const handleStartDateChange = (date: string) => {
    console.log('ComparisonSelector - startDate changée:', date);
    // Toujours utiliser 'custom' et la date de fin actuelle
    setTempComparisonDateRange('custom', date, tempComparisonEndDate || '');
  };
  
  // Mettre à jour la date de fin personnalisée
  const handleEndDateChange = (date: string) => {
    console.log('ComparisonSelector - endDate changée:', date);
    // Toujours utiliser 'custom' et la date de début actuelle
    setTempComparisonDateRange('custom', tempComparisonStartDate || '', date);
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {COMPARISON_OPTIONS.map((period) => (
          <PeriodOption 
            key={period.value}
            label={period.label}
            isSelected={tempComparisonRange === period.value}
            onClick={() => handlePeriodSelect(period.value)}
          />
        ))}
      </div>
      
      {tempComparisonRange === 'custom' ? (
        <CustomDateRange 
          startDate={tempComparisonStartDate || ''}
          endDate={tempComparisonEndDate || ''}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
        />
      ) : (
        <div className="flex items-center mt-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <span className="mr-2">Période calculée :</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {tempComparisonStartDate && tempComparisonEndDate ? (
              `${formatDateForDisplay(tempComparisonStartDate)} - ${formatDateForDisplay(tempComparisonEndDate)}`
            ) : (
              '01/03/2024 - 31/03/2024'
            )}
          </span>
        </div>
      )}
    </div>
  );
}