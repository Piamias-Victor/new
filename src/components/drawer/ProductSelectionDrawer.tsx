// src/components/drawer/ProductSelectionDrawer.tsx
'use client';

import React, { useState } from 'react';
import { FiX, FiCheck, FiFilter } from 'react-icons/fi';
import { LabSearch } from './search/LabSearch';
import { ProductSearch } from './search/ProductSearch';
import { UnifiedSegmentSearch } from './search/SegmentSearch';
import { SelectionSummary } from './SelectionSummary';
import { useProductFilter } from '@/contexts/ProductFilterContext';

interface ProductSelectionDrawerProps {
  isOpen: boolean;
  isClosing?: boolean;
  onClose: () => void;
  onApplyFilter?: () => void;
}

type SearchTab = 'product' | 'laboratory' | 'segment';

export function ProductSelectionDrawer({ 
  isOpen, 
  isClosing, 
  onClose, 
  onApplyFilter 
}: ProductSelectionDrawerProps) {
  const [activeTab, setActiveTab] = useState<SearchTab>('product');
  
  const {
    selectedProducts,
    selectedLabs,
    selectedSegments,
    selectedCodes,
    toggleProduct,
    toggleLab,
    toggleSegment,
    clearFilters,
    totalSelectedCount,
    filterMode,
    toggleFilterMode
  } = useProductFilter();

  if (!isOpen) return null;
  
  // Gérer la confirmation
  const handleApplyFilter = () => {
    if (onApplyFilter) {
      onApplyFilter();
    }
    onClose();
  };

  return (
    <>
      {/* Overlay semi-transparent */}
      <div 
        className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40"
        onClick={onClose}
      />
      
      {/* Drawer avec animation */}
      <div className={`fixed right-0 top-0 bottom-0 w-full sm:w-96 md:w-[450px] bg-white dark:bg-gray-800 shadow-lg z-50 flex flex-col transform transition-all duration-300 ease-in-out ${
        isClosing ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100 animate-slideInRight'
      }`}>
        {/* En-tête du drawer */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sélection de produits
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <FiX size={20} />
          </button>
        </div>
        
        {/* Mode de filtrage */}
        {totalSelectedCount > 1 && (
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-750">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiFilter className="mr-2 text-purple-500" size={16} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mode de filtrage:
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleFilterMode()}
                  className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                    filterMode === 'AND' 
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  ET
                </button>
                <button
                  onClick={() => toggleFilterMode()}
                  className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                    filterMode === 'OR' 
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  OU
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className='p-2'>
           {/* Afficher le sommaire de la sélection */}
        {totalSelectedCount > 0 && (
            <SelectionSummary
              selectedProducts={selectedProducts}
              selectedLabs={selectedLabs}
              selectedSegments={selectedSegments}
              onRemoveProduct={toggleProduct}
              onRemoveLab={toggleLab}
              onRemoveSegment={toggleSegment}
              onClearAll={clearFilters}
            />
          )}
        </div>

       

        {/* Onglets de recherche */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`flex-1 py-3 font-medium text-sm transition-colors ${
              activeTab === 'product' 
                ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('product')}
          >
            Par produit
          </button>
          <button
            className={`flex-1 py-3 font-medium text-sm transition-colors ${
              activeTab === 'laboratory' 
                ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('laboratory')}
          >
            Par laboratoire
          </button>
          <button
            className={`flex-1 py-3 font-medium text-sm transition-colors ${
              activeTab === 'segment' 
                ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('segment')}
          >
            Par segment
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'product' && (
            <ProductSearch 
              selectedProducts={selectedProducts} 
              onToggleProduct={toggleProduct} 
            />
          )}
          {activeTab === 'laboratory' && (
            <LabSearch 
              selectedLabs={selectedLabs}
              onToggleLab={toggleLab}
            />
          )}
          {activeTab === 'segment' && (
            <UnifiedSegmentSearch
              selectedSegments={selectedSegments}
              onToggleSegment={toggleSegment}
            />
          )}
          
        </div>

        {/* Pied du drawer avec bouton de confirmation */}
        {totalSelectedCount > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleApplyFilter}
              className="w-full py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg flex items-center justify-center"
            >
              <FiCheck className="mr-2" size={16} />
              Appliquer le filtre ({selectedCodes.length} codes)
            </button>
          </div>
        )}
      </div>
    </>
  );
}