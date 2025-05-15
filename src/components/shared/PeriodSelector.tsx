'use client';

import React, { useState, useEffect } from 'react';
import { PeriodOption } from './PeriodOption';
import { CustomDateRange } from './CustomDateRange';
import { useDateRange, DateRangeType } from '@/contexts/DateRangeContext';
import { PERIOD_OPTIONS } from './date-constants';

export function PeriodSelector() {
  const { tempRange, tempStartDate, tempEndDate, setTempDateRange } = useDateRange();
  
  // Mettre à jour le contexte temporaire lorsqu'une option est sélectionnée
  const handlePeriodSelect = (value: string) => {
    const periodType = value as DateRangeType;
    
    if (periodType !== 'custom') {
      // Pour les périodes prédéfinies, mettre à jour immédiatement
      setTempDateRange(periodType);
    } else {
      // Pour custom, définir le type mais conserver les dates actuelles
      // S'assurer que nous avons des dates valides à utiliser
      if (tempStartDate && tempEndDate) {
        setTempDateRange('custom', tempStartDate, tempEndDate);
      } else {
        // Si pas de dates valides, utiliser aujourd'hui et dans 7 jours comme valeurs par défaut
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        const defaultStart = today.toISOString().split('T')[0];
        const defaultEnd = nextWeek.toISOString().split('T')[0];
        
        setTempDateRange('custom', defaultStart, defaultEnd);
      }
    }
  };
  
  // Mettre à jour la date de début personnalisée
  const handleStartDateChange = (date: string) => {
    console.log('PeriodSelector - startDate changée:', date);
    // Ne mettre à jour que si la date est non vide
    if (date) {
      // Toujours utiliser 'custom' et la date de fin actuelle, ou une date par défaut
      const endDateToUse = tempEndDate || new Date().toISOString().split('T')[0];
      setTempDateRange('custom', date, endDateToUse);
    }
  };
  
  // Mettre à jour la date de fin personnalisée
  const handleEndDateChange = (date: string) => {
    console.log('PeriodSelector - endDate changée:', date);
    // Ne mettre à jour que si la date est non vide
    if (date) {
      // Toujours utiliser 'custom' et la date de début actuelle, ou une date par défaut
      const startDateToUse = tempStartDate || new Date().toISOString().split('T')[0];
      setTempDateRange('custom', startDateToUse, date);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {PERIOD_OPTIONS.map((period) => (
          <PeriodOption 
            key={period.value}
            label={period.label}
            isSelected={tempRange === period.value}
            onClick={() => handlePeriodSelect(period.value)}
          />
        ))}
      </div>
      
      {tempRange === 'custom' && (
        <CustomDateRange 
          startDate={tempStartDate || ''}
          endDate={tempEndDate || ''}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
        />
      )}
    </div>
  );
}