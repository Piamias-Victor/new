// src/components/dashboard/stock/ProductStockMonthsPanelFiltered.tsx
import React, { useState } from 'react';
import { FiClock } from 'react-icons/fi';
import { StockSummaryCard } from './StockSummaryCard';
import { StockProductsModal } from './StockProductsModal';
import { useStockMonthsFiltered } from '@/hooks/useStockMonthsFiltered';
import { useProductFilter } from '@/contexts/ProductFilterContext';

export function ProductStockMonthsPanelFiltered() {
  // État pour la modale
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  
  // Vérifier si un filtre est actif
  const { isFilterActive } = useProductFilter();
  
  // Récupérer les données des mois de stock avec le hook filtré
  const { 
    criticalLow, 
    toWatch, 
    optimal, 
    overStock, 
    criticalHigh,
    isLoading, 
    error 
  } = useStockMonthsFiltered();
  
  // Fonction pour ouvrir la modale avec une catégorie spécifique
  const openModal = (products, title) => {
    setSelectedProducts(products);
    setModalTitle(title);
    setModalOpen(true);
  };
  
  // Affichage pendant le chargement
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
  
  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="text-red-500 dark:text-red-400">
          Erreur: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center mb-4">
        <FiClock className="text-gray-500 dark:text-gray-400 mr-2" size={18} />
        <h2 className="text-base font-medium text-gray-700 dark:text-gray-300">
          Analyse des mois de stock
        </h2>
      </div>
      
      <div className="space-y-3">
        <StockSummaryCard
          title="Sous-stock critique"
          description="Produits avec moins d'1 mois de stock"
          count={criticalLow.length}
          colorScheme="red"
          icon="alert"
          onClick={() => openModal(criticalLow, "Produits en sous-stock critique (< 1 mois)")}
        />
        
        <StockSummaryCard
          title="Stocks à surveiller"
          description="Produits avec 1 à 2 mois de stock"
          count={toWatch.length}
          colorScheme="amber"
          icon="watch"
          onClick={() => openModal(toWatch, "Produits à surveiller (1-2 mois)")}
        />
        
        <StockSummaryCard
          title="Stocks optimaux"
          description="Produits avec 3 à 6 mois de stock"
          count={optimal.length}
          colorScheme="green"
          icon="optimal"
          onClick={() => openModal(optimal, "Produits avec stock optimal (3-6 mois)")}
        />
        
        <StockSummaryCard
          title="Surstock modéré"
          description="Produits avec 6 à 12 mois de stock"
          count={overStock.length}
          colorScheme="blue"
          icon="overstock"
          onClick={() => openModal(overStock, "Produits en surstock modéré (6-12 mois)")}
        />
        
        <StockSummaryCard
          title="Surstock critique"
          description="Produits avec plus de 12 mois de stock"
          count={criticalHigh.length}
          colorScheme="purple"
          icon="critical-high"
          onClick={() => openModal(criticalHigh, "Produits en surstock critique (> 12 mois)")}
        />
      </div>
      
      {/* Modale pour afficher les produits */}
      <StockProductsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        products={selectedProducts}
        title={modalTitle}
      />
    </div>
  );
}