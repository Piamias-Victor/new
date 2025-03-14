// src/components/shared/date-selector/ComparisonSelector.tsx
import React, { useState } from 'react';
import { PeriodOption } from './PeriodOption';
import { CustomDateRange } from './CustomDateRange';
import { COMPARISON_OPTIONS } from './date-constants';

export function ComparisonSelector() {
  const [selectedPeriod, setSelectedPeriod] = useState('previousYear');
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {COMPARISON_OPTIONS.map((period) => (
          <PeriodOption 
            key={period.value}
            label={period.label}
            isSelected={selectedPeriod === period.value}
            onClick={() => setSelectedPeriod(period.value)}
          />
        ))}
      </div>
      
      {selectedPeriod === 'custom' ? (
        <CustomDateRange 
          startDate="2024-03-01"
          endDate="2024-03-31"
        />
      ) : (
        <div className="flex items-center mt-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <span className="mr-2">Période calculée :</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">01/03/2024 - 31/03/2024</span>
        </div>
      )}
    </div>
  );
}