// src/components/shared/DateRangeSelectorDropdown.tsx
'use client';

import React, { useState } from 'react';
import { ComparisonRangeOptions } from './ComparisonRangeOptions';
import { CustomDateRange } from './CustomDateRange';
import { DateRangeTabs } from './DateRangeTabs';
import { PresetRangeOptions } from './PresetRangeOptions';


interface DateRangeSelectorDropdownProps {
  onClose: () => void;
}

export function DateRangeSelectorDropdown({ onClose }: DateRangeSelectorDropdownProps) {
  const [activeTab, setActiveTab] = useState<'primary' | 'comparison'>('primary');
  const [selectedRange, setSelectedRange] = useState('thisMonth');
  const [selectedComparisonRange, setSelectedComparisonRange] = useState('previousYear');
  const [primaryStartDate, setPrimaryStartDate] = useState('2025-02-01');
  const [primaryEndDate, setPrimaryEndDate] = useState('2025-02-28');
  const [compStartDate, setCompStartDate] = useState('2024-02-01');
  const [compEndDate, setCompEndDate] = useState('2024-02-29');

  const handleSelectPresetRange = (newRange: string) => {
    setSelectedRange(newRange);
  };

  const handleSelectComparisonRange = (newRange: string) => {
    setSelectedComparisonRange(newRange);
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">
      <DateRangeTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'primary' ? (
        <>
          <PresetRangeOptions 
            selectedRange={selectedRange} 
            onSelectRange={handleSelectPresetRange} 
          />

          {selectedRange === 'custom' && (
            <CustomDateRange
              startDate={primaryStartDate}
              endDate={primaryEndDate}
              onStartDateChange={setPrimaryStartDate}
              onEndDateChange={setPrimaryEndDate}
              onApply={() => {}}
            />
          )}
        </>
      ) : (
        <>
          <ComparisonRangeOptions 
            selectedRange={selectedComparisonRange}
            onSelectRange={handleSelectComparisonRange}
          />

          {selectedComparisonRange === 'custom' && (
            <CustomDateRange
              startDate={compStartDate}
              endDate={compEndDate}
              onStartDateChange={setCompStartDate}
              onEndDateChange={setCompEndDate}
              onApply={() => {}}
            />
          )}
          
          {selectedComparisonRange !== 'custom' && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-400">
              <div className="font-medium mb-1">Période de comparaison:</div>
              <div>01/02/2024 - 29/02/2024</div>
            </div>
          )}
        </>
      )}

      <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
        <button
          onClick={onClose}
          className="px-3 py-1 text-xs bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}