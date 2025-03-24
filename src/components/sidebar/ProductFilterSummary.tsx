// src/components/sidebar/ProductFilterSummary.tsx
import React from 'react';
import { FiPackage } from 'react-icons/fi';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { SidebarCard } from './SidebarCard';

export function ProductFilterSummary() {
  const { selectedProducts, selectedLabs, selectedSegments, selectedCodes, isFilterActive } = useProductFilter();
  
  if (!isFilterActive) {
    return (
      <SidebarCard title="Produits" icon={<FiPackage size={16} className="text-purple-500" />}>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Aucun filtre de produit actif
        </div>
      </SidebarCard>
    );
  }

  // Pour l'affichage résumé
  const totalSelections = selectedProducts.length + selectedLabs.length + selectedSegments.length;
  
  return (
    <SidebarCard title="Produits" icon={<FiPackage size={16} className="text-purple-500" />}>
      <div className="space-y-2">
        <div className="inline-flex items-center px-2.5 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
          {selectedCodes.length} codes EAN
        </div>
        
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {totalSelections} sélection{totalSelections > 1 ? 's' : ''}
          {selectedProducts.length > 0 && ` • ${selectedProducts.length} produit${selectedProducts.length > 1 ? 's' : ''}`}
          {selectedLabs.length > 0 && ` • ${selectedLabs.length} labo${selectedLabs.length > 1 ? 's' : ''}`}
          {selectedSegments.length > 0 && ` • ${selectedSegments.length} segment${selectedSegments.length > 1 ? 's' : ''}`}
        </div>
      </div>
    </SidebarCard>
  );
}