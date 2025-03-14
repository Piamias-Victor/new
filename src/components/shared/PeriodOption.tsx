import React from 'react';
import { FiArrowRight } from 'react-icons/fi';

interface PeriodOptionProps { 
  label: string; 
  isSelected: boolean; 
  onClick: () => void;
}

export function PeriodOption({ label, isSelected, onClick }: PeriodOptionProps) {
  return (
    <button
      className={`py-2 px-3 text-sm rounded flex items-center justify-between transition-colors duration-150 ${
        isSelected
          ? 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800/50'
          : 'bg-white text-gray-700 border border-gray-200 hover:border-sky-200 hover:text-sky-600 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:border-sky-800/50 dark:hover:text-sky-400'
      }`}
      onClick={onClick}
    >
      <span>{label}</span>
      {isSelected && <FiArrowRight className="ml-1" size={14} />}
    </button>
  );
}