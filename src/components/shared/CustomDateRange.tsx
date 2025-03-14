// src/components/shared/date-selector/CustomDateRange.tsx
import React from 'react';

interface CustomDateRangeProps {
  startDate: string;
  endDate: string;
  onStartDateChange?: (value: string) => void;
  onEndDateChange?: (value: string) => void;
}

export function CustomDateRange({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}: CustomDateRangeProps) {
  return (
    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/30 rounded border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Du
          </label>
          <input
            type="date"
            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            defaultValue={startDate}
            onChange={e => onStartDateChange && onStartDateChange(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Au
          </label>
          <input
            type="date"
            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            defaultValue={endDate}
            onChange={e => onEndDateChange && onEndDateChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}