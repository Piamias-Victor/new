// src/components/sidebar/ProductFilterSummary.tsx
import React, { useState } from 'react';
import { FiPackage, FiBox, FiLayers, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { SidebarCard } from './SidebarCard';

export function ProductFilterSummary() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    selectedProducts, 
    selectedLabs, 
    selectedSegments, 
    selectedCodes, 
    isFilterActive,
    totalSelectedCount
  } = useProductFilter();

  // Si aucun produit n'est sélectionné
  if (!isFilterActive || totalSelectedCount === 0) {
    return (
      <SidebarCard
        title="Produits"
        icon={<FiPackage size={16} className="text-purple-500" />}
      >
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Aucun filtre de produit actif
        </div>
      </SidebarCard>
    );
  }

  return (
    <SidebarCard
      title="Produits"
      icon={<FiPackage size={16} className="text-purple-500" />}
    >
      <div className="space-y-3">
        {/* Résumé des sélections */}
        <div className="inline-flex items-center px-2.5 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
          {selectedCodes.length} codes EAN sélectionnés
        </div>
        
        {/* Détails des sélections */}
        <div className="flex flex-col space-y-1 text-sm">
          {selectedProducts.length > 0 && (
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <FiBox size={14} className="text-purple-500 mr-2" />
              <span>
                {selectedProducts.length} produit{selectedProducts.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          {selectedLabs.length > 0 && (
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <FiLayers size={14} className="text-indigo-500 mr-2" />
              <span>
                {selectedLabs.length} laboratoire{selectedLabs.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          {selectedSegments.length > 0 && (
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <FiLayers size={14} className="text-blue-500 mr-2" />
              <span>
                {selectedSegments.length} segment{selectedSegments.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        
        {/* Bouton pour voir plus de détails */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors mt-1"
        >
          {isExpanded ? (
            <>
              <FiChevronUp size={14} className="mr-1" /> 
              Voir moins
            </>
          ) : (
            <>
              <FiChevronDown size={14} className="mr-1" /> 
              Voir détails
            </>
          )}
        </button>
        
        {/* Détails des éléments sélectionnés */}
        {isExpanded && (
          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border-t border-gray-100 dark:border-gray-700 pt-2">
            {/* Produits sélectionnés */}
            {selectedProducts.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Produits :
                </div>
                <ul className="space-y-1 ml-2">
                  {selectedProducts.slice(0, 5).map(product => (
                    <li key={product.id} className="text-xs text-gray-600 dark:text-gray-300 truncate">
                      • {product.display_name}
                    </li>
                  ))}
                  {selectedProducts.length > 5 && (
                    <li className="text-xs text-gray-500 dark:text-gray-400">
                      + {selectedProducts.length - 5} autres
                    </li>
                  )}
                </ul>
              </div>
            )}
            
            {/* Laboratoires sélectionnés */}
            {selectedLabs.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Laboratoires :
                </div>
                <ul className="space-y-1 ml-2">
                  {selectedLabs.slice(0, 5).map(lab => (
                    <li key={lab.name} className="text-xs text-gray-600 dark:text-gray-300 truncate">
                      • {lab.name}
                    </li>
                  ))}
                  {selectedLabs.length > 5 && (
                    <li className="text-xs text-gray-500 dark:text-gray-400">
                      + {selectedLabs.length - 5} autres
                    </li>
                  )}
                </ul>
              </div>
            )}
            
            {/* Segments sélectionnés */}
            {selectedSegments.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Segments :
                </div>
                <ul className="space-y-1 ml-2">
                  {selectedSegments.slice(0, 5).map(segment => (
                    <li key={segment.id} className="text-xs text-gray-600 dark:text-gray-300 truncate">
                      • {segment.name}
                    </li>
                  ))}
                  {selectedSegments.length > 5 && (
                    <li className="text-xs text-gray-500 dark:text-gray-400">
                      + {selectedSegments.length - 5} autres
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </SidebarCard>
  );
}