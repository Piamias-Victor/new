// src/components/drawer/ProductSelectionDrawer.tsx
import React, { useState } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import { LabSearch } from './search/LabSearch';
import { ProductSearch } from './search/ProductSearch';
import { Product } from './search/ProductSearchResults';
import { Laboratory } from './search/LabSearchResults';
import { SelectionSummary } from './SelectionSummary';
import { UnifiedSegment, UnifiedSegmentSearch } from './search/SegmentSearch';

interface ProductSelectionDrawerProps {
  isOpen: boolean;
  isClosing?: boolean;
  onClose: () => void;
  selectedProducts: Product[];
  onToggleProduct: (product: Product) => void;
  selectedLabs?: Laboratory[];
  onToggleLab?: (lab: Laboratory) => void;
  selectedSegments?: UnifiedSegment[];
  onToggleSegment?: (segment: UnifiedSegment) => void;
  onConfirmSelection?: () => void;
}

type SearchTab = 'product' | 'laboratory' | 'segment';

export function ProductSelectionDrawer({ 
  isOpen, 
  isClosing, 
  onClose, 
  selectedProducts,
  onToggleProduct,
  selectedLabs = [],
  onToggleLab = () => {},
  selectedSegments = [],
  onToggleSegment = () => {},
  onConfirmSelection
}: ProductSelectionDrawerProps) {
  const [activeTab, setActiveTab] = useState<SearchTab>('product');

  if (!isOpen) return null;

  // Calculer le nombre total de produits/laboratoires/segments sélectionnés
  const totalSelected = selectedProducts.length + selectedLabs.length + selectedSegments.length;
  
  // Calculer le nombre total de codes EAN associés
  const totalCodes = [
    ...selectedProducts.map(p => p.code_13_ref),
    ...selectedLabs.flatMap(lab => lab.code_13_refs || []),
    ...selectedSegments.flatMap(segment => segment.code_13_refs || [])
  ].filter((code, index, self) => self.indexOf(code) === index).length;
  
  // Fonctions pour supprimer des éléments
  const handleRemoveProduct = (product: Product) => {
    onToggleProduct(product);
  };
  
  const handleRemoveLab = (lab: Laboratory) => {
    if (onToggleLab) onToggleLab(lab);
  };
  
  const handleRemoveSegment = (segment: UnifiedSegment) => {
    if (onToggleSegment) onToggleSegment(segment);
  };
  
  // Fonction pour tout effacer
  const handleClearAll = () => {
    // Désélectionner tous les produits
    selectedProducts.forEach(product => onToggleProduct(product));
    
    // Désélectionner tous les laboratoires
    if (onToggleLab) {
      selectedLabs.forEach(lab => onToggleLab(lab));
    }
    
    // Désélectionner tous les segments
    if (onToggleSegment) {
      selectedSegments.forEach(segment => onToggleSegment(segment));
    }
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
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {totalSelected} éléments sélectionnés • {totalCodes} codes EAN associés
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
        
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'product' && (
            <ProductSearch 
              selectedProducts={selectedProducts} 
              onToggleProduct={onToggleProduct} 
            />
          )}
          {activeTab === 'laboratory' && (
            <LabSearch 
              selectedLabs={selectedLabs}
              onToggleLab={onToggleLab}
            />
          )}
          {activeTab === 'segment' && (
            <UnifiedSegmentSearch
              selectedSegments={selectedSegments}
              onToggleSegment={onToggleSegment}
            />
          )}
          
          {/* Afficher le sommaire de la sélection */}
          {totalSelected > 0 && (
            <SelectionSummary
              selectedProducts={selectedProducts}
              selectedLabs={selectedLabs}
              selectedSegments={selectedSegments}
              onRemoveProduct={handleRemoveProduct}
              onRemoveLab={handleRemoveLab}
              onRemoveSegment={handleRemoveSegment}
              onClearAll={handleClearAll}
            />
          )}
        </div>

        {/* Pied du drawer avec bouton de confirmation */}
        {totalSelected > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onConfirmSelection}
              className="w-full py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg flex items-center justify-center"
            >
              <FiCheck className="mr-2" size={16} />
              Confirmer la sélection ({totalSelected} éléments, {totalCodes} codes)
            </button>
          </div>
        )}
      </div>
    </>
  );
}