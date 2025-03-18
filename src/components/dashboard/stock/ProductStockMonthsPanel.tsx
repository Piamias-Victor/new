// src/components/dashboard/products/ProductStockMonthsPanel.tsx
import React, { useState, useMemo } from 'react';
import { FiClock } from 'react-icons/fi';
import { Product } from '@/services/productService';

import { StockProductData } from '@/hooks/useStockMonths';
import { StockProductsModal } from './StockProductsModal';
import { StockSummaryCard } from './StockSummaryCard';

interface ProductStockMonthsPanelProps {
  products: Product[];
  isLoading: boolean;
}

export function ProductStockMonthsPanel({ products, isLoading }: ProductStockMonthsPanelProps) {
  // État pour la modale
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<StockProductData[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  
      // Calculer les mois de stock pour chaque produit
  const stockCategories = useMemo(() => {
    if (!products.length) return {
      criticalLow: [],
      toWatch: [],
      optimal: [],
      overStock: [],
      criticalHigh: []
    };
    
    // Convertir les produits au format attendu par la modale
    const convertedProducts: StockProductData[] = products.map(product => {
      // Calculer les ventes mensuelles moyennes
      // Utilisez les attributs disponibles dans votre objet Product
      
      // Estimation plus réaliste des ventes mensuelles
      let avgMonthlySales = 0;
      if (product.total_sales) {
        // Si nous avons les ventes totales, supposons qu'elles sont sur une période de 3 mois
        avgMonthlySales = Number(product.total_sales) / 3;
      } else if (product.margin_percentage) {
        // Si nous avons le pourcentage de marge mais pas les ventes, faisons une estimation arbitraire
        // Cette partie est à ajuster selon les données disponibles dans votre objet Product
        avgMonthlySales = Math.max(1, Number(product.current_stock) / 10);
      } else {
        // Par défaut, estimons qu'un produit en stock se vend en moyenne à 2 unités par mois
        avgMonthlySales = 2;
      }
      
      // Calculer les mois de stock
      const stockMonths = Number(product.current_stock) / avgMonthlySales;
      
      // Pour les produits sans vente ou avec très peu de ventes, limiter à 12 mois max
      // au lieu de mettre une valeur arbitraire très élevée
      const normalizedStockMonths = avgMonthlySales < 0.1 ? Math.min(12, stockMonths) : stockMonths;
      
      return {
        id: product.id,
        product_name: product.name,
        global_name: product.display_name,
        display_name: product.display_name || product.name,
        category: product.category || '',
        brand_lab: product.brand_lab || '',
        code_13_ref: product.code_13_ref || '',
        current_stock: Number(product.current_stock) || 0,
        avg_monthly_sales: avgMonthlySales,
        stock_months: stockMonths
      };
    });
    
    // Classifier par catégories
    return {
      criticalLow: convertedProducts.filter(p => p.stock_months < 1),
      toWatch: convertedProducts.filter(p => p.stock_months >= 1 && p.stock_months < 3),
      optimal: convertedProducts.filter(p => p.stock_months >= 3 && p.stock_months <= 6),
      overStock: convertedProducts.filter(p => p.stock_months > 6 && p.stock_months <= 12),
      criticalHigh: convertedProducts.filter(p => p.stock_months > 12)
    };
  }, [products]);
  
  // Fonction pour ouvrir la modale avec une catégorie spécifique
  const openModal = (products: StockProductData[], title: string) => {
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
        <FiClock className="text-gray-500 dark:text-gray-400 mr-2" size={18} />
        <h2 className="text-base font-medium text-gray-700 dark:text-gray-300">
          Analyse des mois de stock ({products.length} produits)
        </h2>
      </div>
      
      <div className="space-y-3">
        <StockSummaryCard
          title="Sous-stock critique"
          description="Produits avec moins d'1 mois de stock"
          count={stockCategories.criticalLow.length}
          colorScheme="red"
          icon="alert"
          onClick={() => openModal(stockCategories.criticalLow, "Produits en sous-stock critique (< 1 mois)")}
        />
        
        <StockSummaryCard
          title="Stocks à surveiller"
          description="Produits avec 1 à 2 mois de stock"
          count={stockCategories.toWatch.length}
          colorScheme="amber"
          icon="watch"
          onClick={() => openModal(stockCategories.toWatch, "Produits à surveiller (1-2 mois)")}
        />
        
        <StockSummaryCard
          title="Stocks optimaux"
          description="Produits avec 3 à 6 mois de stock"
          count={stockCategories.optimal.length}
          colorScheme="green"
          icon="optimal"
          onClick={() => openModal(stockCategories.optimal, "Produits avec stock optimal (3-6 mois)")}
        />
        
        <StockSummaryCard
          title="Surstock modéré"
          description="Produits avec 6 à 12 mois de stock"
          count={stockCategories.overStock.length}
          colorScheme="blue"
          icon="overstock"
          onClick={() => openModal(stockCategories.overStock, "Produits en surstock modéré (6-12 mois)")}
        />
        
        <StockSummaryCard
          title="Surstock critique"
          description="Produits avec plus de 12 mois de stock"
          count={stockCategories.criticalHigh.length}
          colorScheme="purple"
          icon="critical-high"
          onClick={() => openModal(stockCategories.criticalHigh, "Produits en surstock critique (> 12 mois)")}
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