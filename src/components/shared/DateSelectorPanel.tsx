// src/components/shared/date-selector/DateSelectorPanel.tsx
'use client';

import React, { useState } from 'react';
import { FiCalendar, FiClock, FiArrowRightCircle } from 'react-icons/fi';
import { ComparisonSelector } from './ComparisonSelector';
import { TabButton } from './TabButton';
import { PeriodSelector } from './PeriodSelector';


interface DateSelectorPanelProps {
  onClose: () => void;
}

export function DateSelectorPanel({ onClose }: DateSelectorPanelProps) {
  const [tab, setTab] = useState<'primary' | 'comparison'>('primary');
  
  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <TabButton 
          label="Période d'analyse" 
          icon={<FiCalendar size={16} />} 
          isActive={tab === 'primary'} 
          onClick={() => setTab('primary')} 
        />
        <TabButton 
          label="Comparaison" 
          icon={<FiClock size={16} />} 
          isActive={tab === 'comparison'} 
          onClick={() => setTab('comparison')} 
        />
      </div>
      
      {/* Content */}
      <div className="p-4">
        {tab === 'primary' ? (
          <PeriodSelector />
        ) : (
          <ComparisonSelector />
        )}
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={onClose}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Annuler
        </button>
        <button 
          onClick={onClose}
          className="flex items-center space-x-1 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium rounded"
        >
          <span>Appliquer</span>
          <FiArrowRightCircle size={14} />
        </button>
      </div>
    </div>
  );
}