import React, { useState, useMemo } from 'react';
import { FiClock } from 'react-icons/fi';
import { Product } from '@/services/productService';

import { StockProductData } from '@/hooks/useStockMonths';
import { StockProductsModal } from './StockProductsModal';
import { StockSummaryCard } from './StockSummaryCard';

interface ProductStockMonthsPanelProps {
  products: Product[];
  labData?: any;
  isLoading: boolean;
}

export function ProductStockMonthsPanel({ 
  products, 
  labData = {}, 
  isLoading 
}: ProductStockMonthsPanelProps) {
  // État pour la modale
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<StockProductData[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  
  // Calculer les mois de stock 
  const stockCategories = useMemo(() => {
    // Utiliser les données du laboratoire si disponibles
    const criticalLow = labData?.stock_months?.criticalLow || [];
    const toWatch = labData?.stock_months?.toWatch || [];
    const optimal = labData?.stock_months?.optimal || [];
    const overStock = labData?.stock_months?.overStock || [];
    const criticalHigh = labData?.stock_months?.criticalHigh || [];

    // Si les données du laboratoire existent et contiennent des catégories, les utiliser
    if (criticalLow.length || toWatch.length || optimal.length || overStock.length || criticalHigh.length) {
      return {
        criticalLow,
        toWatch,
        optimal,
        overStock,
        criticalHigh
      };
    }

    // Consolidation des produits par code_13_ref (identifiant unique du produit)
    const consolidatedProducts = products.reduce((acc, product) => {
      const existingProduct = acc.find(p => p.code_13_ref === product.code_13_ref);
      
      if (!existingProduct) {
        // Premier produit de ce type
        acc.push({
          code_13_ref: product.code_13_ref || '',
          display_name: product.display_name || product.name,
          current_stock: Number(product.current_stock) || 0,
          total_sales: Number(product.total_sales) || 0
        });
      } else {
        // Accumulation des stocks pour ce produit
        existingProduct.current_stock += Number(product.current_stock) || 0;
        existingProduct.total_sales += Number(product.total_sales) || 0;
      }
      
      return acc;
    }, [] as Array<{
      code_13_ref: string, 
      display_name: string, 
      current_stock: number, 
      total_sales: number
    }>);

    // Conversion en données de stock
    const convertedProducts: StockProductData[] = consolidatedProducts.map(product => {
      // Estimation des ventes mensuelles
      const avgMonthlySales = product.total_sales > 0 
        ? product.total_sales / 3  // Moyenne sur 3 mois
        : 2; // Valeur par défaut si pas de ventes
      
      // Calculer les mois de stock
      const stockMonths = product.current_stock / avgMonthlySales;
      
      return {
        id: product.code_13_ref,
        product_name: product.display_name,
        global_name: product.display_name,
        display_name: product.display_name,
        category: '', // Pourrait être ajouté si nécessaire
        brand_lab: '', // Pourrait être ajouté si nécessaire
        code_13_ref: product.code_13_ref,
        current_stock: product.current_stock,
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
  }, [products, labData]);
  
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
          Analyse des mois de stock
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