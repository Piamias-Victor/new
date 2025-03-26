// src/components/dashboard/prices/ProductPriceComparisonPanel.tsx
import React, { useState } from 'react';
import { MdEuro } from "react-icons/md";
import { PriceSummaryCard } from './PriceSummaryCard';
import { PriceComparisonModal } from './PriceComparisonModal';
import { usePriceComparison } from '@/hooks/usePriceComparison';
import { useProductFilter } from '@/contexts/ProductFilterContext';

export function ProductPriceComparisonPanel() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  
  const { isFilterActive } = useProductFilter();
  
  const { 
    veryLowPrice, 
    lowPrice, 
    averagePrice, 
    highPrice, 
    veryHighPrice,
    isLoading, 
    error 
  } = usePriceComparison();
  
  const openModal = (products, title) => {
    setSelectedProducts(products);
    setModalTitle(title);
    setModalOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 animate-pulse">
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full mr-2"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="text-red-500 dark:text-red-400">
          Erreur: {error}
        </div>
      </div>
    );
  }
  
  if (!isFilterActive) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="text-center p-6">
          <MdEuro className="mx-auto text-gray-400 mb-3" size={24} />
          <p className="text-gray-500 dark:text-gray-400">
            Sélectionnez des produits via le filtre pour voir leur analyse de prix
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center mb-4">
        <MdEuro className="text-gray-500 dark:text-gray-400 mr-2" size={18} />
        <h2 className="text-base font-medium text-gray-700 dark:text-gray-300">
          Analyse comparative des prix Apothical
        </h2>
      </div>
      
      <div className="space-y-3">
        <PriceSummaryCard
          title="Prix très bas"
          description="Plus de 15% sous la moyenne"
          count={veryLowPrice.length}
          colorScheme="red"
          icon="very-low"
          onClick={() => openModal(veryLowPrice, "Prix très bas (> 15% sous la moyenne)")}
        />
        
        <PriceSummaryCard
          title="Prix bas"
          description="Entre 5% et 15% sous la moyenne"
          count={lowPrice.length}
          colorScheme="amber"
          icon="low"
          onClick={() => openModal(lowPrice, "Prix bas (5-15% sous la moyenne)")}
        />
        
        <PriceSummaryCard
          title="Prix moyen"
          description="Variation entre -5% et +5%"
          count={averagePrice.length}
          colorScheme="blue"
          icon="average"
          onClick={() => openModal(averagePrice, "Prix moyen (±5% de la moyenne)")}
        />
        
        <PriceSummaryCard
          title="Prix élevé"
          description="Entre 5% et 15% au-dessus"
          count={highPrice.length}
          colorScheme="green"
          icon="high"
          onClick={() => openModal(highPrice, "Prix élevé (5-15% au-dessus)")}
        />
        
        <PriceSummaryCard
          title="Prix très élevé"
          description="Plus de 15% au-dessus"
          count={veryHighPrice.length}
          colorScheme="purple"
          icon="very-high"
          onClick={() => openModal(veryHighPrice, "Prix très élevé (> 15% au-dessus)")}
        />
      </div>
      
      <PriceComparisonModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        products={selectedProducts}
        title={modalTitle}
      />
    </div>
  );
}