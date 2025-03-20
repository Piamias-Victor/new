// src/components/drawer/SelectionSummary.tsx
import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiX, FiPackage, FiGrid, FiTag } from 'react-icons/fi';
import { Product } from './search/ProductSearchResults';
import { Laboratory } from './search/LabSearchResults';
import { UnifiedSegment } from './search/SegmentSearch';

interface SelectionSummaryProps {
  selectedProducts: Product[];
  selectedLabs: Laboratory[];
  selectedSegments: UnifiedSegment[];
  onRemoveProduct: (product: Product) => void;
  onRemoveLab: (lab: Laboratory) => void;
  onRemoveSegment: (segment: UnifiedSegment) => void;
  onClearAll: () => void;
}

export function SelectionSummary({
  selectedProducts,
  selectedLabs,
  selectedSegments,
  onRemoveProduct,
  onRemoveLab,
  onRemoveSegment,
  onClearAll
}: SelectionSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const totalItems = selectedProducts.length + selectedLabs.length + selectedSegments.length;
  
  if (totalItems === 0) {
    return null;
  }
  
  // Calculer le nombre total de codes EAN
  const uniqueCodes = new Set([
    ...selectedProducts.map(p => p.code_13_ref),
    ...selectedLabs.flatMap(lab => lab.code_13_refs || []),
    ...selectedSegments.flatMap(segment => segment.code_13_refs || [])
  ]);
  
  // Pour le message récapitulatif
  const getSummaryMessage = () => {
    const parts = [];
    if (selectedProducts.length > 0) {
      parts.push(`${selectedProducts.length} produit${selectedProducts.length > 1 ? 's' : ''}`);
    }
    if (selectedLabs.length > 0) {
      parts.push(`${selectedLabs.length} laboratoire${selectedLabs.length > 1 ? 's' : ''}`);
    }
    if (selectedSegments.length > 0) {
      parts.push(`${selectedSegments.length} segment${selectedSegments.length > 1 ? 's' : ''}`);
    }
    
    return parts.join(', ');
  };
  
  // Obtenir l'icône appropriée pour le type de segment
  const getSegmentIcon = (type?: string) => {
    switch (type) {
      case 'universe':
        return <FiGrid size={14} className="text-blue-500" />;
      case 'category':
      case 'subcategory':
        return <FiTag size={14} className="text-purple-500" />;
      case 'family':
      case 'subfamily':
        return <FiTag size={14} className="text-green-500" />;
      default:
        return <FiPackage size={14} className="text-gray-500" />;
    }
  };
  
  return (
    <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* En-tête du sommaire */}
      <div 
        className="p-3 bg-gray-50 dark:bg-gray-800 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full w-6 h-6 flex items-center justify-center mr-2">
            {totalItems}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Sélection actuelle
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {getSummaryMessage()} • {uniqueCodes.size} codes EAN
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          {isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearAll();
              }}
              className="mr-2 text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
            >
              Tout effacer
            </button>
          )}
          {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </div>
      </div>
      
      {/* Liste des éléments sélectionnés */}
      {isExpanded && (
        <div className="px-3 py-2 max-h-[200px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
          {/* Produits sélectionnés */}
          {selectedProducts.length > 0 && (
            <div className="py-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Produits
              </div>
              <div className="space-y-2">
                {selectedProducts.map(product => (
                  <div 
                    key={product.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex-1 truncate mr-2">
                      <span className="text-gray-900 dark:text-white truncate">
                        {product.display_name}
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveProduct(product)}
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Laboratoires sélectionnés */}
          {selectedLabs.length > 0 && (
            <div className="py-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Laboratoires
              </div>
              <div className="space-y-2">
                {selectedLabs.map(lab => (
                  <div 
                    key={lab.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex-1 truncate mr-2">
                      <span className="text-gray-900 dark:text-white truncate">
                        {lab.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        ({lab.code_13_refs?.length || 0} produits)
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveLab(lab)}
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Segments sélectionnés */}
          {selectedSegments.length > 0 && (
            <div className="py-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Segments
              </div>
              <div className="space-y-2">
                {selectedSegments.map(segment => (
                  <div 
                    key={segment.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex-1 truncate mr-2">
                      <span className="text-gray-900 dark:text-white truncate flex items-center">
                        {getSegmentIcon(segment.type)}
                        <span className="ml-1">{segment.name}</span>
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        ({segment.productCount} produits)
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveSegment(segment)}
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}