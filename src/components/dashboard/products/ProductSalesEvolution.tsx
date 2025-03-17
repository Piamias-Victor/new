// src/components/dashboard/products/ProductSalesEvolution.tsx (mise à jour)
import React, { useState, useMemo } from 'react';
import { FiTrendingUp, FiArrowUpRight, FiArrowDownRight, FiBarChart2, FiPieChart, FiFilter, FiCheck } from 'react-icons/fi';
import { Product } from '@/services/productService';
import { useProductSalesEvolution } from '@/hooks/useProductSalesEvolution';
import { ProductDetailedChart } from './ProductDetailedChart';
import { ProductSalesChart } from './ProductSalesChart';
import { ProductSalesInsights } from './ProductSalesInsights';


interface ProductSalesEvolutionChartProps {
  products: Product[];
  isLoading?: boolean;
}

export function ProductSalesEvolutionChart({ products, isLoading: parentLoading = false }: ProductSalesEvolutionChartProps) {
  const [interval, setInterval] = useState<'day' | 'week' | 'month'>('day');
  const [showMargin, setShowMargin] = useState(true);
  const [viewMode, setViewMode] = useState<'total' | 'detailed'>('total');
  const [showProductSelector, setShowProductSelector] = useState(false);
  
  // État pour stocker les IDs des produits sélectionnés
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  
  // Effet pour initialiser les produits sélectionnés
  React.useEffect(() => {
    if (products.length > 0) {
      // Par défaut, sélectionner tous les produits
      setSelectedProductIds(products.map(p => p.id));
    }
  }, [products]);
  
  const { totalData, detailedData, isLoading, error } = useProductSalesEvolution(products, interval);
  
  // Calculer la tendance (% d'évolution)
  const calculateTrend = () => {
    if (!totalData || totalData.length < 2) return { value: 0, isPositive: true };
    
    const firstValue = totalData[0]?.total_revenue || 0;
    const lastValue = totalData[totalData.length - 1]?.total_revenue || 0;
    
    const change = lastValue - firstValue;
    const percentChange = firstValue !== 0 ? (change / firstValue) * 100 : 0;
    
    return {
      value: Math.abs(percentChange).toFixed(1),
      isPositive: percentChange >= 0
    };
  };
  
  // Filtrer les données détaillées pour n'inclure que les produits sélectionnés
  const filteredDetailedData = useMemo(() => {
    const filtered: Record<string, any> = {};
    Object.entries(detailedData).forEach(([productId, productData]) => {
      if (selectedProductIds.includes(productId)) {
        filtered[productId] = productData;
      }
    });
    return filtered;
  }, [detailedData, selectedProductIds]);
  
  // Fonction pour gérer la sélection/désélection d'un produit
  const toggleProductSelection = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      // Si déjà sélectionné, le désélectionner (sauf si c'est le dernier)
      if (selectedProductIds.length > 1) {
        setSelectedProductIds(prev => prev.filter(id => id !== productId));
      }
    } else {
      // Sinon l'ajouter
      setSelectedProductIds(prev => [...prev, productId]);
    }
  };
  
  // Fonction pour tout sélectionner/désélectionner
  const toggleAllProducts = () => {
    if (selectedProductIds.length === Object.keys(detailedData).length) {
      // Si tous sont sélectionnés, n'en garder qu'un (le premier)
      const firstProductId = Object.keys(detailedData)[0];
      setSelectedProductIds(firstProductId ? [firstProductId] : []);
    } else {
      // Sinon sélectionner tous
      setSelectedProductIds(Object.keys(detailedData));
    }
  };
  
  const trend = calculateTrend();
  const isCurrentlyLoading = isLoading || parentLoading;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
            <FiTrendingUp size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Évolution des ventes par produit
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Tendance : 
              <span className={`font-medium ml-1 flex items-center ${
                trend.isPositive 
                  ? 'text-green-500 dark:text-green-400' 
                  : 'text-red-500 dark:text-red-400'
              }`}>
                {trend.isPositive ? <FiArrowUpRight className="mr-1" /> : <FiArrowDownRight className="mr-1" />}
                {trend.value}%
              </span>
            </div>
          </div>
        </div>

        {/* Options du graphique */}
        <div className="flex flex-wrap gap-3">
          {/* Affichage du sélecteur de produits si en mode détaillé et si on a plus d'un produit */}
          {viewMode === 'detailed' && Object.keys(detailedData).length > 1 && (
            <button
              onClick={() => setShowProductSelector(!showProductSelector)}
              className="flex items-center px-3 py-1.5 text-xs rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <FiFilter className="mr-1.5" size={14} />
              Filtrer ({selectedProductIds.length}/{Object.keys(detailedData).length})
            </button>
          )}
          
          {/* Sélection du mode de visualisation */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mr-2">
            <button
              onClick={() => setViewMode('total')}
              className={`px-3 py-1.5 text-xs rounded flex items-center ${
                viewMode === 'total' 
                  ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <FiBarChart2 size={14} className="mr-1" />
              Total
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-1.5 text-xs rounded flex items-center ${
                viewMode === 'detailed' 
                  ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <FiPieChart size={14} className="mr-1" />
              Détail
            </button>
          </div>
          
          {/* Sélection de l'affichage de la marge */}
          <button
            onClick={() => setShowMargin(!showMargin)}
            className={`flex items-center px-3 py-1.5 text-xs rounded ${
              showMargin 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            <span className="w-3 h-3 rounded-full bg-emerald-500 dark:bg-emerald-400 mr-1"></span>
            Marge
          </button>
          
          {/* Sélection de l'intervalle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setInterval('day')}
              className={`px-3 py-1 text-xs rounded ${
                interval === 'day' 
                  ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Jour
            </button>
            <button
              onClick={() => setInterval('week')}
              className={`px-3 py-1 text-xs rounded ${
                interval === 'week' 
                  ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setInterval('month')}
              className={`px-3 py-1 text-xs rounded ${
                interval === 'month' 
                  ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Mois
            </button>
          </div>
        </div>
      </div>
      
      {/* Sélecteur de produits */}
      {showProductSelector && viewMode === 'detailed' && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sélectionner les produits à afficher
            </h3>
            <button 
              onClick={toggleAllProducts}
              className="text-xs text-sky-600 dark:text-sky-400 hover:underline"
            >
              {selectedProductIds.length === Object.keys(detailedData).length 
                ? "Tout désélectionner" 
                : "Tout sélectionner"}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.entries(detailedData).map(([productId, productData]) => (
              <div 
                key={productId}
                className={`flex items-center p-2 rounded cursor-pointer ${
                  selectedProductIds.includes(productId)
                    ? 'bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/50'
                    : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
                onClick={() => toggleProductSelection(productId)}
              >
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ 
                    backgroundColor: selectedProductIds.includes(productId) 
                      ? Object.values(filteredDetailedData).length > 0 
                        ? Object.values(filteredDetailedData).findIndex(p => p.name === productData.name) > -1
                          ? Object.values(filteredDetailedData).findIndex(p => p.name === productData.name) < 5
                            ? ['#0ea5e9', '#f97316', '#8b5cf6', '#14b8a6', '#ef4444'][Object.values(filteredDetailedData).findIndex(p => p.name === productData.name)]
                            : '#6b7280'
                          : '#6b7280'
                        : '#6b7280'
                      : '#6b7280'
                  }}
                ></div>
                <span className={`text-xs ${
                  selectedProductIds.includes(productId)
                    ? 'font-medium text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {productData.name}
                </span>
                {selectedProductIds.includes(productId) && (
                  <FiCheck className="ml-auto text-sky-500 dark:text-sky-400" size={14} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'total' ? (
        <ProductSalesChart 
          data={totalData} 
          isLoading={isCurrentlyLoading} 
          error={error}
          interval={interval}
          showMargin={showMargin}
        />
      ) : (
        <ProductDetailedChart 
          data={filteredDetailedData} 
          isLoading={isCurrentlyLoading} 
          error={error}
          interval={interval}
          showMargin={showMargin}
        />
      )}
      
      {totalData && totalData.length > 0 && (
        <ProductSalesInsights data={totalData} interval={interval} />
      )}
    </div>
  );
}