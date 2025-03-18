// src/components/dashboard/margins/ProductMarginsSummary.tsx
import React, { useState, useMemo } from 'react';
import { FiPercent } from 'react-icons/fi';
import { MarginSummaryCard } from './MarginSummaryCard';
import { MarginProductsModal } from './MarginProductsModal';
import { useProductMargins, MarginProductData } from '@/hooks/useProductMargins';

export function ProductMarginsSummary() {
  // Récupérer les données des marges
  const { 
    negativeMargin, 
    lowMargin, 
    mediumMargin, 
    goodMargin, 
    excellentMargin,
    isLoading, 
    error 
  } = useProductMargins();
  
  // État pour la modale
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<MarginProductData[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  
  // Calculs des marges moyennes
  const averageMargins = useMemo(() => {
    const calculateAverage = (products: MarginProductData[]) => {
      if (!products.length) return 0;
      
      const sum = products.reduce((acc, product) => {
        return acc + Number(product.margin_percentage);
      }, 0);
      
      return sum / products.length;
    };
    
    return {
      negative: calculateAverage(negativeMargin),
      low: calculateAverage(lowMargin),
      medium: calculateAverage(mediumMargin),
      good: calculateAverage(goodMargin),
      excellent: calculateAverage(excellentMargin)
    };
  }, [negativeMargin, lowMargin, mediumMargin, goodMargin, excellentMargin]);
  
  // Fonction pour ouvrir la modale avec une catégorie spécifique
  const openModal = (products: MarginProductData[], title: string) => {
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
        <FiPercent className="text-gray-500 dark:text-gray-400 mr-2" size={18} />
        <h2 className="text-base font-medium text-gray-700 dark:text-gray-300">
          Analyse des marges par produit
        </h2>
      </div>
      
      <div className="space-y-3">
        <MarginSummaryCard
          title="Marges négatives"
          description="Produits avec une marge inférieure à 0%"
          count={negativeMargin.length}
          averageMargin={averageMargins.negative}
          colorScheme="red"
          icon="negative"
          onClick={() => openModal(negativeMargin, "Produits à marge négative (< 0%)")}
        />
        
        <MarginSummaryCard
          title="Faibles marges"
          description="Produits avec une marge entre 0% et 10%"
          count={lowMargin.length}
          averageMargin={averageMargins.low}
          colorScheme="amber"
          icon="low"
          onClick={() => openModal(lowMargin, "Produits à faible marge (0-10%)")}
        />
        
        <MarginSummaryCard
          title="Marges moyennes"
          description="Produits avec une marge entre 10% et 20%"
          count={mediumMargin.length}
          averageMargin={averageMargins.medium}
          colorScheme="blue"
          icon="medium"
          onClick={() => openModal(mediumMargin, "Produits à marge moyenne (10-20%)")}
        />
        
        <MarginSummaryCard
          title="Bonnes marges"
          description="Produits avec une marge entre 20% et 35%"
          count={goodMargin.length}
          averageMargin={averageMargins.good}
          colorScheme="green"
          icon="good"
          onClick={() => openModal(goodMargin, "Produits à bonne marge (20-35%)")}
        />
        
        <MarginSummaryCard
          title="Excellentes marges"
          description="Produits avec une marge supérieure à 35%"
          count={excellentMargin.length}
          averageMargin={averageMargins.excellent}
          colorScheme="purple"
          icon="excellent"
          onClick={() => openModal(excellentMargin, "Produits à excellente marge (> 35%)")}
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