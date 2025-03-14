// src/components/shared/date-selector/ModernDateSelector.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiCalendar, FiChevronDown } from 'react-icons/fi';
import { DateSelectorPanel } from './DateSelectorPanel';

export function ModernDateSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative z-10" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white dark:bg-gray-800 flex items-center h-10 pl-4 pr-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm hover:border-sky-300 dark:hover:border-sky-600 transition-colors duration-150 group"
      >
        <div className="flex items-center space-x-2">
          <span className="text-sky-500 dark:text-sky-400">
            <FiCalendar size={18} />
          </span>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Ce mois-ci
          </span>
          <span className="text-xs px-2 text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700 flex items-center">
            vs Année précédente
          </span>
        </div>
        <div className="ml-2 text-gray-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors duration-150">
          <FiChevronDown size={16} className={isOpen ? "transform rotate-180" : ""} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-150 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <DateSelectorPanel onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}