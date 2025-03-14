// src/components/shared/date-selector/DatePeriodBadge.tsx
import React from 'react';
import { FiCalendar } from 'react-icons/fi';

export function DatePeriodBadge() {
  return (
    <div className="inline-flex flex-col bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center">
          <FiCalendar className="mr-1.5" size={12} />
          Période d'analyse
        </span>
      </div>
      <div className="px-3 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <span className="h-2 w-2 bg-sky-500 rounded-full mr-2"></span>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Ce mois-ci</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 ml-3">01/03/2025 - 31/03/2025</div>
      </div>
      <div className="px-3 py-2 flex justify-between items-center bg-gray-50 dark:bg-gray-900/20">
        <div className="flex items-center">
          <span className="h-2 w-2 bg-emerald-500 rounded-full mr-2"></span>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Comparé à N-1</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 ml-3">01/03/2024 - 31/03/2024</div>
      </div>
    </div>
  );
}