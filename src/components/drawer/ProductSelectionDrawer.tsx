// src/components/drawer/ProductSelectionDrawer.tsx
import React, { useState } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import { LabSearch } from './search/LabSearch';
import { ProductSearch } from './search/ProductSearch';
import { SegmentSearch } from './search/SegmentSearch';
import { Product } from './search/ProductSearchResults';

interface ProductSelectionDrawerProps {
  isOpen: boolean;
  isClosing?: boolean;
  onClose: () => void;
  selectedProducts: Product[];
  onToggleProduct: (product: Product) => void;
  onConfirmSelection?: () => void;
}

type SearchTab = 'product' | 'laboratory' | 'segment';

/**
 * Drawer de sélection de produits avec 3 onglets de recherche
 */
export function ProductSelectionDrawer({ 
  isOpen, 
  isClosing, 
  onClose, 
  selectedProducts,
  onToggleProduct,
  onConfirmSelection
}: ProductSelectionDrawerProps) {
  const [activeTab, setActiveTab] = useState<SearchTab>('product');

  if (!isOpen) return null;

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
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {selectedProducts.length} produit(s) sélectionné(s)
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <FiX size={20} />
          </button>
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

        {/* Contenu du drawer - change selon l'onglet actif */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'product' && (
            <ProductSearch 
              selectedProducts={selectedProducts} 
              onToggleProduct={onToggleProduct} 
            />
          )}
          {activeTab === 'laboratory' && <LabSearch />}
          {activeTab === 'segment' && <SegmentSearch />}
        </div>

        {/* Pied du drawer avec bouton de confirmation */}
        {selectedProducts.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onConfirmSelection}
              className="w-full py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg flex items-center justify-center"
            >
              <FiCheck className="mr-2" size={16} />
              Confirmer la sélection ({selectedProducts.length})
            </button>
          </div>
        )}
      </div>
    </>
  );
}