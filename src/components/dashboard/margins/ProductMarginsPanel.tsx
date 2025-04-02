// src/components/dashboard/margins/ProductMarginsPanelFiltered.tsx
import React, { useState } from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { MarginSummaryCard } from './MarginSummaryCard';
import { MarginProductsModal } from './MarginProductsModal';
import { useProductMarginsFiltered } from '@/hooks/useProductMarginsFiltered';
import { useProductFilter } from '@/contexts/ProductFilterContext';

export function ProductMarginsPanelFiltered() {
  // État pour la modale
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  
  // Vérifier si un filtre est actif
  const { isFilterActive } = useProductFilter();
  
  // Récupérer les données des marges avec le hook filtré
  const { 
    negativeMargin, 
    lowMargin, 
    mediumMargin, 
    goodMargin, 
    excellentMargin,
    isLoading, 
    error 
  } = useProductMarginsFiltered();
  
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
        <FiTrendingUp className="text-gray-500 dark:text-gray-400 mr-2" size={18} />
        <h2 className="text-base font-medium text-gray-700 dark:text-gray-300">
          Analyse des marges
        </h2>
      </div>
      
      <div className="space-y-3">
        <MarginSummaryCard
          title="Marge négative"
          description="Produits vendus à perte"
          count={negativeMargin.length}
          colorScheme="red"
          icon="negative"
          onClick={() => openModal(negativeMargin, "Produits vendus à perte")}
        />
        
        <MarginSummaryCard
          title="Marge faible"
          description="Produits avec marge inférieure à 25%"
          count={lowMargin.length}
          colorScheme="amber"
          icon="low"
          onClick={() => openModal(lowMargin, "Produits avec marge inférieure à 25%")}
        />
        
        <MarginSummaryCard
          title="Marge moyenne"
          description="Produits avec marge entre 25% et 30%"
          count={mediumMargin.length}
          colorScheme="blue"
          icon="medium"
          onClick={() => openModal(mediumMargin, "Produits avec marge entre 25% et 30%")}
        />
        
        <MarginSummaryCard
          title="Bonne marge"
          description="Produits avec marge entre 30% et 35%"
          count={goodMargin.length}
          colorScheme="green"
          icon="good"
          onClick={() => openModal(goodMargin, "Produits avec marge entre 30% et 35%")}
        />
        
        <MarginSummaryCard
          title="Marge excellente"
          description="Produits avec marge supérieure à 35%"
          count={excellentMargin.length}
          colorScheme="purple"
          icon="excellent"
          onClick={() => openModal(excellentMargin, "Produits avec marge supérieure à 35%")}
        />
      </div>
      
      {/* Modale pour afficher les produits */}
      <MarginProductsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        products={selectedProducts}
        title={modalTitle}
      />
    </div>
  );
}