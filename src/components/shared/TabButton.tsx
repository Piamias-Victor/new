// src/components/shared/date-selector/TabButton.tsx
import React from 'react';

interface TabButtonProps { 
  label: string; 
  icon: React.ReactNode; 
  isActive: boolean; 
  onClick: () => void;
}

export function TabButton({ label, icon, isActive, onClick }: TabButtonProps) {
  return (
    <button 
      className={`flex-1 flex items-center justify-center py-3 text-sm font-medium ${
        isActive 
          ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-500 dark:border-sky-400' 
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
      }`}
      onClick={onClick}
    >
      <span className="mr-2">{icon}</span>
      <span>{label}</span>
    </button>
  );
}