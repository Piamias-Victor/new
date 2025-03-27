// src/components/filters/ActiveEanFilter.tsx
'use client';

import React from 'react';
import { FiFilter, FiX } from 'react-icons/fi';
import { useProductFilter } from '@/contexts/ProductFilterContext';

export function ActiveEanFilter() {
  const { 
    selectedCodes, 
    totalSelectedCount, 
    clearFilters, 
    isFilterActive,
    filterMode,
    toggleFilterMode
  } = useProductFilter();
  
  // Ne rien afficher si aucun filtre n'est actif
  if (!isFilterActive) {
    return null;
  }
  
  return (
    <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-full bg-sky-100 dark:bg-sky-800/50 text-sky-600 dark:text-sky-400">
            <FiFilter size={16} />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Filtre actif ({filterMode === 'AND' ? 'ET' : 'OU'})
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {selectedCodes.length} codes EAN • {totalSelectedCount} sélection{totalSelectedCount > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleFilterMode}
            className="px-2 py-1 text-xs rounded bg-sky-100 hover:bg-sky-200 text-sky-700 dark:bg-sky-900/50 dark:hover:bg-sky-800/70 dark:text-sky-300"
            title={filterMode === 'AND' ? "Basculer en mode OU (union)" : "Basculer en mode ET (intersection)"}
          >
            Mode: {filterMode === 'AND' ? "ET" : "OU"}
          </button>
          
          <button
            onClick={clearFilters}
            className="p-2 rounded-md text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50"
            title="Supprimer le filtre"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}