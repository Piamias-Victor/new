// src/components/shared/date-selector/PeriodSelector.tsx
import React, { useState } from 'react';
import { PeriodOption } from './PeriodOption';
import { CustomDateRange } from './CustomDateRange';
import { PERIOD_OPTIONS } from './date-constants';

export function PeriodSelector() {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {PERIOD_OPTIONS.map((period) => (
          <PeriodOption 
            key={period.value}
            label={period.label}
            isSelected={selectedPeriod === period.value}
            onClick={() => setSelectedPeriod(period.value)}
          />
        ))}
      </div>
      
      {selectedPeriod === 'custom' && (
        <CustomDateRange 
          startDate="2025-03-01"
          endDate="2025-03-31"
        />
      )}
    </div>
  );
}