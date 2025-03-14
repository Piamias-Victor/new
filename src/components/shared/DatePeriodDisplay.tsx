'use client';

import React from 'react';
import { FiCalendar, FiRefreshCw } from 'react-icons/fi';
import { useDateRange } from '@/contexts/DateRangeContext';
import { formatDateForDisplay } from '@/utils/dateUtils';

export function DatePeriodDisplay() {
  const { 
    displayLabel, 
    startDate, 
    endDate, 
    comparisonDisplayLabel, 
    comparisonStartDate, 
    comparisonEndDate,
    isComparisonEnabled
  } = useDateRange();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm overflow-hidden">
      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
          <FiCalendar className="mr-2" size={14} /> 
          Périodes analysées
        </div>
      </div>
      
      <div className="px-3 py-2">
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="py-1">
                <div className="w-2 h-2 bg-sky-500 rounded-sm inline-block mr-2"></div>
                <span className="font-medium text-gray-700 dark:text-gray-300">{displayLabel}</span>
              </td>
              <td className="text-right text-xs text-gray-500 dark:text-gray-400">
                {formatDateForDisplay(startDate)} - {formatDateForDisplay(endDate)}
              </td>
            </tr>
            
            {isComparisonEnabled && comparisonStartDate && comparisonEndDate && (
              <tr>
                <td className="py-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-sm inline-block mr-2"></div>
                  <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <FiRefreshCw className="mr-1" size={12} />
                    {comparisonDisplayLabel}
                  </span>
                </td>
                <td className="text-right text-xs text-gray-500 dark:text-gray-400">
                  {formatDateForDisplay(comparisonStartDate)} - {formatDateForDisplay(comparisonEndDate)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}