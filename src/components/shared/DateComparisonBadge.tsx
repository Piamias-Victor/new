// src/components/shared/DateComparisonBadge.tsx
'use client';

import React from 'react';
import { FiCalendar, FiRefreshCw } from 'react-icons/fi';

export function DateComparisonBadge() {
  // Données fictives pour le design
  const primaryPeriod = {
    label: "Ce mois-ci",
    dates: "01/02/2025 - 28/02/2025"
  };
  
  const comparisonPeriod = {
    label: "Année précédente",
    dates: "01/02/2024 - 29/02/2024"
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
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
                <span className="font-medium text-gray-700 dark:text-gray-300">{primaryPeriod.label}</span>
              </td>
              <td className="text-right text-xs text-gray-500 dark:text-gray-400">
                {primaryPeriod.dates}
              </td>
            </tr>
            <tr>
              <td className="py-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-sm inline-block mr-2"></div>
                <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <FiRefreshCw className="mr-1" size={12} />
                  {comparisonPeriod.label}
                </span>
              </td>
              <td className="text-right text-xs text-gray-500 dark:text-gray-400">
                {comparisonPeriod.dates}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}