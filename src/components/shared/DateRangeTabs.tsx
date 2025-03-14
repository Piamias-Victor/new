// src/components/shared/DateRangeTabs.tsx
'use client';

import React from 'react';
import { FiCalendar, FiClock } from 'react-icons/fi';

interface DateRangeTabsProps {
  activeTab: 'primary' | 'comparison';
  onTabChange: (tab: 'primary' | 'comparison') => void;
}

export function DateRangeTabs({ activeTab, onTabChange }: DateRangeTabsProps) {
  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => onTabChange('primary')}
        className={`flex-1 py-2 text-sm font-medium ${
          activeTab === 'primary'
            ? 'text-sky-600 border-b-2 border-sky-500 dark:text-sky-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        <div className="flex items-center justify-center">
          <FiCalendar className="mr-2" size={16} />
          Période principale
        </div>
      </button>
      <button
        onClick={() => onTabChange('comparison')}
        className={`flex-1 py-2 text-sm font-medium ${
          activeTab === 'comparison'
            ? 'text-sky-600 border-b-2 border-sky-500 dark:text-sky-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        <div className="flex items-center justify-center">
          <FiClock className="mr-2" size={16} />
          Comparaison
        </div>
      </button>
    </div>
  );
}