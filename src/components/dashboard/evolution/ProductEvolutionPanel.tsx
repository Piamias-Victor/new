// src/components/dashboard/evolution/ProductEvolutionPanel.tsx
import React, { useState } from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { useEvolutionComparison, ProductEvolution } from '@/hooks/useEvolutionComparison';
import { EvolutionSummaryCard } from './EvolutionSummaryCard';
import { EvolutionProductsModal } from './EvolutionProductsModal';

export function ProductEvolutionPanel() {
  // Utiliser notre hook personnalisé
  const { 
    categories,
    globalComparison,
    isLoading, 
    error 
  } = useEvolutionComparison();
  
  // État pour la modale
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<ProductEvolution[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  
  // Fonction pour ouvrir la modale avec une catégorie spécifique
  const openModal = (products: ProductEvolution[], title: string) => {
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
          Évolution des produits
        </h2>
      </div>
      
      <div className="space-y-3">
        <EvolutionSummaryCard
          title={categories.strongDecrease.name}
          description={categories.strongDecrease.description}
          count={categories.strongDecrease.count}
          colorScheme="red"
          icon="strongDecrease"
          onClick={() => openModal(categories.strongDecrease.products, `${categories.strongDecrease.name} (${categories.strongDecrease.description})`)}
        />
        
        <EvolutionSummaryCard
          title={categories.slightDecrease.name}
          description={categories.slightDecrease.description}
          count={categories.slightDecrease.count}
          colorScheme="amber"
          icon="slightDecrease"
          onClick={() => openModal(categories.slightDecrease.products, `${categories.slightDecrease.name} (${categories.slightDecrease.description})`)}
        />
        
        <EvolutionSummaryCard
          title={categories.stable.name}
          description={categories.stable.description}
          count={categories.stable.count}
          colorScheme="blue"
          icon="stable"
          onClick={() => openModal(categories.stable.products, `${categories.stable.name} (${categories.stable.description})`)}
        />
        
        <EvolutionSummaryCard
          title={categories.slightIncrease.name}
          description={categories.slightIncrease.description}
          count={categories.slightIncrease.count}
          colorScheme="green"
          icon="slightIncrease"
          onClick={() => openModal(categories.slightIncrease.products, `${categories.slightIncrease.name} (${categories.slightIncrease.description})`)}
        />
        
        <EvolutionSummaryCard
          title={categories.strongIncrease.name}
          description={categories.strongIncrease.description}
          count={categories.strongIncrease.count}
          colorScheme="purple"
          icon="strongIncrease"
          onClick={() => openModal(categories.strongIncrease.products, `${categories.strongIncrease.name} (${categories.strongIncrease.description})`)}
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