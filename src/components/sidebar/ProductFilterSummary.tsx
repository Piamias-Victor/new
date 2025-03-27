import React from 'react';
import { FiPackage, FiTrash, FiX } from 'react-icons/fi';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { SidebarCard } from './SidebarCard';
import { Product } from '@/components/drawer/search/ProductSearchResults';
import { Laboratory } from '@/components/drawer/search/LabSearchResults';
import { UnifiedSegment } from '@/components/drawer/search/SegmentSearch';

export function ProductFilterSummary() {
  const { 
    selectedProducts, 
    selectedLabs, 
    selectedSegments, 
    selectedCodes, 
    isFilterActive,
    clearFilters,
    toggleProduct,
    toggleLab,
    toggleSegment,
    filterMode,
    toggleFilterMode
  } = useProductFilter();
  
  if (!isFilterActive) {
    return (
      <SidebarCard 
        title="Produits" 
        icon={<FiPackage size={16} className="text-purple-500" />}
        className="text-sm text-gray-500 dark:text-gray-400"
      >
        Aucun filtre de produit actif
      </SidebarCard>
    );
  }

  // Fonction générique pour supprimer un élément
  const removeItem = (
    item: Product | Laboratory | UnifiedSegment, 
    type: 'product' | 'lab' | 'segment'
  ) => {
    switch(type) {
      case 'product':
        toggleProduct(item as Product);
        break;
      case 'lab':
        toggleLab(item as Laboratory);
        break;
      case 'segment':
        toggleSegment(item as UnifiedSegment);
        break;
    }
  };

  return (
    <SidebarCard 
      title="Produits" 
      icon={<FiPackage size={16} className="text-purple-500" />}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="inline-flex items-center px-2.5 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
            {selectedCodes.length} codes EAN
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={toggleFilterMode}
              className="text-gray-500 hover:text-purple-500 dark:text-gray-400 dark:hover:text-purple-400 px-2 py-1 text-xs rounded bg-gray-100 hover:bg-purple-100 dark:bg-gray-700 dark:hover:bg-purple-900/30"
              title={filterMode === 'AND' ? "Basculer en mode OU (union)" : "Basculer en mode ET (intersection)"}
            >
              Mode: {filterMode === 'AND' ? "ET" : "OU"}
            </button>
            
            {selectedCodes.length > 0 && (
              <button 
                onClick={clearFilters}
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                title="Réinitialiser tous les filtres"
              >
                <FiTrash size={16} />
              </button>
            )}
          </div>
        </div>
        
        {selectedProducts.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              Produits ({selectedProducts.length})
            </div>
            <div className="max-h-20 overflow-y-auto text-xs text-gray-600 dark:text-gray-400 space-y-1">
              {selectedProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 px-1 py-0.5 rounded"
                >
                  <span className="truncate mr-2">{product.display_name}</span>
                  <button 
                    onClick={() => removeItem(product, 'product')}
                    className="text-gray-400 hover:text-red-500"
                    title="Supprimer ce produit"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {selectedLabs.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              Laboratoires ({selectedLabs.length})
            </div>
            <div className="max-h-20 overflow-y-auto text-xs text-gray-600 dark:text-gray-400 space-y-1">
              {selectedLabs.map((lab) => (
                <div 
                  key={lab.name} 
                  className="flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 px-1 py-0.5 rounded"
                >
                  <span className="truncate mr-2">{lab.name}</span>
                  <button 
                    onClick={() => removeItem(lab, 'lab')}
                    className="text-gray-400 hover:text-red-500"
                    title="Supprimer ce laboratoire"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {selectedSegments.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              Segments ({selectedSegments.length})
            </div>
            <div className="max-h-20 overflow-y-auto text-xs text-gray-600 dark:text-gray-400 space-y-1">
              {selectedSegments.map((segment) => (
                <div 
                  key={segment.id} 
                  className="flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 px-1 py-0.5 rounded"
                >
                  <span className="truncate mr-2">{segment.name}</span>
                  <button 
                    onClick={() => removeItem(segment, 'segment')}
                    className="text-gray-400 hover:text-red-500"
                    title="Supprimer ce segment"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SidebarCard>
  );
}