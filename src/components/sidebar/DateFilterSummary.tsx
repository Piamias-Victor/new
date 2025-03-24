// src/components/sidebar/DateFilterSummary.tsx
import React from 'react';
import { FiCalendar } from 'react-icons/fi';
import { useDateRange } from '@/contexts/DateRangeContext';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { SidebarCard } from './SidebarCard';

export function DateFilterSummary() {
  const { displayLabel, startDate, endDate, comparisonDisplayLabel, isComparisonEnabled } = useDateRange();

  return (
    <SidebarCard title="Période" icon={<FiCalendar size={16} className="text-sky-500" />}>
      <div className="space-y-2">
        <div className="inline-flex items-center px-2.5 py-1 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 rounded-full text-xs font-medium">
          {displayLabel}
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatDateForDisplay(startDate)} - {formatDateForDisplay(endDate)}
        </div>
        
        {isComparisonEnabled && comparisonDisplayLabel && (
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5"></span>
            Comparaison: {comparisonDisplayLabel}
          </div>
        )}
      </div>
    </SidebarCard>
  );
}