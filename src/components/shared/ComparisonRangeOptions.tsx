// src/components/shared/ComparisonRangeOptions.tsx
'use client';

import React from 'react';

// Options pour la période de comparaison
const COMPARISON_RANGES = [
  { label: 'Année précédente', value: 'previousYear' },
  { label: 'Période précédente', value: 'previousPeriod' },
  { label: 'Même période n-1', value: 'sameLastYear' },
  { label: 'Même période n-2', value: 'sameLastTwoYears' },
  { label: 'Personnalisé', value: 'custom' }
];

interface ComparisonRangeOptionsProps {
  selectedRange: string;
  onSelectRange: (range: string) => void;
}

export function ComparisonRangeOptions({ selectedRange, onSelectRange }: ComparisonRangeOptionsProps) {
  return (
    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Période de comparaison</div>
      <div className="space-y-1">
        {COMPARISON_RANGES.map((range) => (
          <button
            key={range.value}
            onClick={() => onSelectRange(range.value)}
            className={`w-full text-left px-2 py-1 text-sm rounded-md ${
              selectedRange === range.value
                ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}