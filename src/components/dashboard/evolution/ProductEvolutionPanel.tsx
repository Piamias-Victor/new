// src/components/dashboard/evolution/ProductEvolutionPanel.tsx
import React, { useState } from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { EvolutionSummaryCard } from './EvolutionSummaryCard';
import { EvolutionProductsModal } from './EvolutionProductsModal';
import { useProductEvolution } from '@/hooks/useProductEvolution';
import { useProductFilter } from '@/contexts/ProductFilterContext';

export function ProductEvolutionPanel() {
  // État pour la modale
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  
  // Vérifier si un filtre est actif
  const { isFilterActive } = useProductFilter();
  
  // Récupérer les données d'évolution
  const { 
    strongDecrease, 
    slightDecrease, 
    stable, 
    slightIncrease, 
    strongIncrease,
    isLoading, 
    error 
  } = useProductEvolution();
  
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
          Évolution des ventes
        </h2>
      </div>
      
      <div className="space-y-3">
        <EvolutionSummaryCard
          title="Forte baisse"
          description="Baisse > 15%"
          count={strongDecrease.length}
          colorScheme="red"
          icon="strong-decrease"
          onClick={() => openModal(strongDecrease, "Produits en forte baisse (> 15%)")}
        />
        
        <EvolutionSummaryCard
          title="Légère baisse"
          description="Baisse entre 5% et 15%"
          count={slightDecrease.length}
          colorScheme="amber"
          icon="slight-decrease"
          onClick={() => openModal(slightDecrease, "Produits en légère baisse (5-15%)")}
        />
        
        <EvolutionSummaryCard
          title="Stable"
          description="Variation entre -5% et 5%"
          count={stable.length}
          colorScheme="blue"
          icon="stable"
          onClick={() => openModal(stable, "Produits stables (-5% à +5%)")}
        />
        
        <EvolutionSummaryCard
          title="Légère hausse"
          description="Hausse entre 5% et 15%"
          count={slightIncrease.length}
          colorScheme="green"
          icon="slight-increase"
          onClick={() => openModal(slightIncrease, "Produits en légère hausse (5-15%)")}
        />
        
        <EvolutionSummaryCard
          title="Forte hausse"
          description="Hausse > 15%"
          count={strongIncrease.length}
          colorScheme="purple"
          icon="strong-increase"
          onClick={() => openModal(strongIncrease, "Produits en forte hausse (> 15%)")}
        />
      </div>
      
      {/* Modale pour afficher les produits */}
      <EvolutionProductsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        products={selectedProducts}
        title={modalTitle}
      />
    </div>
  );
}