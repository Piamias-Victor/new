'use client';

import React, { useState, useEffect } from 'react';
import { PeriodOption } from './PeriodOption';
import { CustomDateRange } from './CustomDateRange';
import { useDateRange, DateRangeType } from '@/contexts/DateRangeContext';
import { PERIOD_OPTIONS } from './date-constants';

export function PeriodSelector() {
  const { range, startDate, endDate, setDateRange } = useDateRange();
  const [selectedPeriod, setSelectedPeriod] = useState<DateRangeType>(range);
  const [customStartDate, setCustomStartDate] = useState(startDate);
  const [customEndDate, setCustomEndDate] = useState(endDate);
  
  // Synchroniser l'état local avec le contexte
  useEffect(() => {
    setSelectedPeriod(range);
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
  }, [range, startDate, endDate]);
  
  // Mettre à jour le contexte lorsqu'une option est sélectionnée
  const handlePeriodSelect = (value: string) => {
    const periodType = value as DateRangeType;
    setSelectedPeriod(periodType);
    
    if (periodType === 'custom') {
      // Pour une période personnalisée, attendre les dates personnalisées
      return;
    }
    
    // Pour les périodes prédéfinies, mettre à jour immédiatement
    setDateRange(periodType);
  };
  
  // Mettre à jour la date de début personnalisée
  const handleStartDateChange = (date: string) => {
    setCustomStartDate(date);
    if (selectedPeriod === 'custom') {
      setDateRange('custom', date, customEndDate);
    }
  };
  
  // Mettre à jour la date de fin personnalisée
  const handleEndDateChange = (date: string) => {
    setCustomEndDate(date);
    if (selectedPeriod === 'custom') {
      setDateRange('custom', customStartDate, date);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {PERIOD_OPTIONS.map((period) => (
          <PeriodOption 
            key={period.value}
            label={period.label}
            isSelected={selectedPeriod === period.value}
            onClick={() => handlePeriodSelect(period.value)}
          />
        ))}
      </div>
      
      {selectedPeriod === 'custom' && (
        <CustomDateRange 
          startDate={customStartDate}
          endDate={customEndDate}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
        />
      )}
    </div>
  );
}