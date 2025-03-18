// src/components/dashboard/margins/ProductMarginsPanel.tsx
import React, { useState, useMemo } from 'react';
import { FiPercent } from 'react-icons/fi';
import { Product } from '@/services/productService';

import { MarginProductData } from '@/hooks/useProductMargins';
import { MarginProductsModal } from './MarginProductsModal';
import { MarginSummaryCard } from './MarginSummaryCard';

interface ProductMarginsPanelProps {
  products: Product[];
  isLoading: boolean;
}

export function ProductMarginsPanel({ products, isLoading }: ProductMarginsPanelProps) {
  // État pour la modale
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<MarginProductData[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  
  // Calculer les marges pour chaque produit
  const marginCategories = useMemo(() => {
    if (!products.length) return {
      negativeMargin: [],
      lowMargin: [],
      mediumMargin: [],
      goodMargin: [],
      excellentMargin: []
    };
    
    // Convertir les produits au format attendu par la modale
    const convertedProducts: MarginProductData[] = products.map(product => {
      // Calculer la marge en pourcentage
      let marginPercentage = 0;
      
      if (product.weighted_average_price && product.price_with_tax && product.tva_rate) {
        // Calculer le prix HT de vente
        const prixHT = product.price_with_tax / (1 + product.tva_rate / 100);
        // Calculer la marge en pourcentage
        marginPercentage = ((prixHT - product.weighted_average_price) / product.weighted_average_price) * 100;
      }
      
      // Calculer la marge en montant
      let marginAmount = 0;
      if (product.weighted_average_price && product.price_with_tax && product.tva_rate) {
        const prixHT = product.price_with_tax / (1 + product.tva_rate / 100);
        marginAmount = prixHT - product.weighted_average_price;
      }
      
      return {
        id: product.id,
        product_name: product.name,
        global_name: product.display_name,
        display_name: product.display_name || product.name,
        category: product.category || '',
        brand_lab: product.brand_lab || '',
        code_13_ref: product.code_13_ref || '',
        current_stock: Number(product.current_stock) || 0,
        price_with_tax: Number(product.price_with_tax) || 0,
        weighted_average_price: Number(product.weighted_average_price) || 0,
        margin_percentage: marginPercentage,
        margin_amount: marginAmount,
        total_sales: product.total_sales || 0
      };
    });
    
    // Classifier par catégories
    return {
      negativeMargin: convertedProducts.filter(p => p.margin_percentage < 0),
      lowMargin: convertedProducts.filter(p => p.margin_percentage >= 0 && p.margin_percentage < 10),
      mediumMargin: convertedProducts.filter(p => p.margin_percentage >= 10 && p.margin_percentage < 20),
      goodMargin: convertedProducts.filter(p => p.margin_percentage >= 20 && p.margin_percentage <= 35),
      excellentMargin: convertedProducts.filter(p => p.margin_percentage > 35)
    };
  }, [products]);
  
  // Calculer les moyennes de marge par catégorie
  const averageMargins = useMemo(() => {
    const calculateAverage = (products: MarginProductData[]) => {
      if (!products.length) return 0;
      
      const sum = products.reduce((acc, product) => {
        return acc + product.margin_percentage;
      }, 0);
      
      return sum / products.length;
    };
    
    return {
      negative: calculateAverage(marginCategories.negativeMargin),
      low: calculateAverage(marginCategories.lowMargin),
      medium: calculateAverage(marginCategories.mediumMargin),
      good: calculateAverage(marginCategories.goodMargin),
      excellent: calculateAverage(marginCategories.excellentMargin)
    };
  }, [marginCategories]);
  
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
  
  // Si pas de produits, ne rien afficher
  if (!products.length) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center mb-4">
        <FiPercent className="text-gray-500 dark:text-gray-400 mr-2" size={18} />
        <h2 className="text-base font-medium text-gray-700 dark:text-gray-300">
          Analyse des marges ({products.length} produits)
        </h2>
      </div>
      
      <div className="space-y-3">
        <MarginSummaryCard
          title="Marges négatives"
          description="Produits avec une marge inférieure à 0%"
          count={marginCategories.negativeMargin.length}
          averageMargin={averageMargins.negative}
          colorScheme="red"
          icon="negative"
          onClick={() => openModal(marginCategories.negativeMargin, "Produits à marge négative (< 0%)")}
        />
        
        <MarginSummaryCard
          title="Faibles marges"
          description="Produits avec une marge entre 0% et 10%"
          count={marginCategories.lowMargin.length}
          averageMargin={averageMargins.low}
          colorScheme="amber"
          icon="low"
          onClick={() => openModal(marginCategories.lowMargin, "Produits à faible marge (0-10%)")}
        />
        
        <MarginSummaryCard
          title="Marges moyennes"
          description="Produits avec une marge entre 10% et 20%"
          count={marginCategories.mediumMargin.length}
          averageMargin={averageMargins.medium}
          colorScheme="blue"
          icon="medium"
          onClick={() => openModal(marginCategories.mediumMargin, "Produits à marge moyenne (10-20%)")}
        />
        
        <MarginSummaryCard
          title="Bonnes marges"
          description="Produits avec une marge entre 20% et 35%"
          count={marginCategories.goodMargin.length}
          averageMargin={averageMargins.good}
          colorScheme="green"
          icon="good"
          onClick={() => openModal(marginCategories.goodMargin, "Produits à bonne marge (20-35%)")}
        />
        
        <MarginSummaryCard
          title="Excellentes marges"
          description="Produits avec une marge supérieure à 35%"
          count={marginCategories.excellentMargin.length}
          averageMargin={averageMargins.excellent}
          colorScheme="purple"
          icon="excellent"
          onClick={() => openModal(marginCategories.excellentMargin, "Produits à excellente marge (> 35%)")}
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