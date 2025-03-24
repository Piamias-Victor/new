// src/components/sidebar/DateFilterSummary.tsx
import React from 'react';
import { FiCalendar, FiRefreshCw } from 'react-icons/fi';
import { useDateRange } from '@/contexts/DateRangeContext';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { SidebarCard } from './SidebarCard';

export function DateFilterSummary() {
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
    <SidebarCard 
      title="Période d'analyse"
      icon={<FiCalendar size={16} className="text-sky-500" />}
    >
      <table className="w-full text-sm">
        <tbody>
          <tr>
            <td className="pb-1">
              <div className="w-2 h-2 bg-sky-500 rounded-sm inline-block mr-2"></div>
              <span className="font-medium text-gray-700 dark:text-gray-300">{displayLabel}</span>
            </td>
          </tr>
          <tr>
            <td className="text-xs text-gray-500 dark:text-gray-400 pb-2">
              {formatDateForDisplay(startDate)} - {formatDateForDisplay(endDate)}
            </td>
          </tr>
          
          {isComparisonEnabled && comparisonStartDate && comparisonEndDate && (
            <>
              <tr>
                <td className="pt-1 pb-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-sm inline-block mr-2"></div>
                  <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <FiRefreshCw className="mr-1" size={12} />
                    {comparisonDisplayLabel || "Période de comparaison"}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDateForDisplay(comparisonStartDate)} - {formatDateForDisplay(comparisonEndDate)}
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </SidebarCard>
  );
}