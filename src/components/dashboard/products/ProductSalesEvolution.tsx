// src/components/dashboard/products/ProductSalesEvolution.tsx
import React, { useState, useMemo } from 'react';
import { FiTrendingUp, FiArrowUpRight, FiArrowDownRight, FiBarChart2, FiPieChart, FiFilter, FiCheck, FiHome } from 'react-icons/fi';
import { Product } from '@/services/productService';
import { useProductSalesEvolution } from '@/hooks/useProductSalesEvolution';
import { ProductSalesChart } from './ProductSalesChart';
import { ProductDetailedChart } from './ProductDetailedChart';
import { ProductPharmacyChart } from './ProductPharmacyChart';
import { ProductSalesInsights } from './ProductSalesInsights';

interface ProductSalesEvolutionChartProps {
  products: Product[];
  isLoading?: boolean;
}

export function ProductSalesEvolutionChart({ products, isLoading: parentLoading = false }: ProductSalesEvolutionChartProps) {
  const [interval, setInterval] = useState<'day' | 'week' | 'month'>('day');
  const [showMargin, setShowMargin] = useState(true);
  const [viewMode, setViewMode] = useState<'total' | 'detailed' | 'pharmacy'>('total');
  const [showEntitySelector, setShowEntitySelector] = useState(false);
  
  // États pour stocker les IDs sélectionnés
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedPharmacyIds, setSelectedPharmacyIds] = useState<string[]>([]);
  
  const { totalData, productData, pharmacyData, isLoading, error } = useProductSalesEvolution(products, interval);
  
  // Effet pour initialiser les sélections
  React.useEffect(() => {
    if (Object.keys(productData).length > 0) {
      setSelectedProductIds(Object.keys(productData));
    }
    if (Object.keys(pharmacyData).length > 0) {
      setSelectedPharmacyIds(Object.keys(pharmacyData));
    }
  }, [productData, pharmacyData]);
  
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
  
  // Filtrer les données détaillées pour n'inclure que les éléments sélectionnés
  const filteredProductData = useMemo(() => {
    const filtered: Record<string, any> = {};
    Object.entries(productData).forEach(([productId, data]) => {
      if (selectedProductIds.includes(productId)) {
        filtered[productId] = data;
      }
    });
    return filtered;
  }, [productData, selectedProductIds]);
  
  const filteredPharmacyData = useMemo(() => {
    const filtered: Record<string, any> = {};
    Object.entries(pharmacyData).forEach(([pharmacyId, data]) => {
      if (selectedPharmacyIds.includes(pharmacyId)) {
        filtered[pharmacyId] = data;
      }
    });
    return filtered;
  }, [pharmacyData, selectedPharmacyIds]);
  
  // Fonction pour gérer la sélection/désélection d'un élément
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
  
  const togglePharmacySelection = (pharmacyId: string) => {
    if (selectedPharmacyIds.includes(pharmacyId)) {
      // Si déjà sélectionné, le désélectionner (sauf si c'est le dernier)
      if (selectedPharmacyIds.length > 1) {
        setSelectedPharmacyIds(prev => prev.filter(id => id !== pharmacyId));
      }
    } else {
      // Sinon l'ajouter
      setSelectedPharmacyIds(prev => [...prev, pharmacyId]);
    }
  };
  
  // Fonction pour tout sélectionner/désélectionner
  const toggleAllProducts = () => {
    if (selectedProductIds.length === Object.keys(productData).length) {
      // Si tous sont sélectionnés, n'en garder qu'un (le premier)
      const firstProductId = Object.keys(productData)[0];
      setSelectedProductIds(firstProductId ? [firstProductId] : []);
    } else {
      // Sinon sélectionner tous
      setSelectedProductIds(Object.keys(productData));
    }
  };
  
  const toggleAllPharmacies = () => {
    if (selectedPharmacyIds.length === Object.keys(pharmacyData).length) {
      // Si tous sont sélectionnés, n'en garder qu'un (le premier)
      const firstPharmacyId = Object.keys(pharmacyData)[0];
      setSelectedPharmacyIds(firstPharmacyId ? [firstPharmacyId] : []);
    } else {
      // Sinon sélectionner tous
      setSelectedPharmacyIds(Object.keys(pharmacyData));
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
          {/* Sélecteur d'entités (produits ou pharmacies selon le mode) */}
          {((viewMode === 'detailed' && Object.keys(productData).length > 1) || 
            (viewMode === 'pharmacy' && Object.keys(pharmacyData).length > 1)) && (
            <button
              onClick={() => setShowEntitySelector(!showEntitySelector)}
              className="flex items-center px-3 py-1.5 text-xs rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <FiFilter className="mr-1.5" size={14} />
              Filtrer ({viewMode === 'detailed' 
                ? `${selectedProductIds.length}/${Object.keys(productData).length}` 
                : `${selectedPharmacyIds.length}/${Object.keys(pharmacyData).length}`})
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
            <button
              onClick={() => setViewMode('pharmacy')}
              className={`px-3 py-1.5 text-xs rounded flex items-center ${
                viewMode === 'pharmacy' 
                  ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <FiHome size={14} className="mr-1" />
              Pharmacies
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
      
      {/* Sélecteur d'entités (produits ou pharmacies) */}
      {showEntitySelector && (viewMode === 'detailed' || viewMode === 'pharmacy') && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {viewMode === 'detailed' 
                ? 'Sélectionner les produits à afficher' 
                : 'Sélectionner les pharmacies à afficher'}
            </h3>
            <button 
              onClick={viewMode === 'detailed' ? toggleAllProducts : toggleAllPharmacies}
              className="text-xs text-sky-600 dark:text-sky-400 hover:underline"
            >
              {(viewMode === 'detailed' && selectedProductIds.length === Object.keys(productData).length) || 
               (viewMode === 'pharmacy' && selectedPharmacyIds.length === Object.keys(pharmacyData).length)
                ? "Tout désélectionner" 
                : "Tout sélectionner"}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {viewMode === 'detailed' ?
              // Affichage des produits
              Object.entries(productData).map(([productId, productData]) => (
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
                        ? ['#0ea5e9', '#f97316', '#8b5cf6', '#14b8a6', '#ef4444'][
                            selectedProductIds.indexOf(productId) % 5
                          ]
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
              )) :
              // Affichage des pharmacies
              Object.entries(pharmacyData).map(([pharmacyId, pharmacyData]) => (
                <div 
                  key={pharmacyId}
                  className={`flex items-center p-2 rounded cursor-pointer ${
                    selectedPharmacyIds.includes(pharmacyId)
                      ? 'bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/50'
                      : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => togglePharmacySelection(pharmacyId)}
                >
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ 
                      backgroundColor: selectedPharmacyIds.includes(pharmacyId) 
                        ? ['#0ea5e9', '#f97316', '#8b5cf6', '#14b8a6', '#ef4444'][
                            selectedPharmacyIds.indexOf(pharmacyId) % 5
                          ]
                        : '#6b7280'
                    }}
                  ></div>
                  <span className={`text-xs ${
                    selectedPharmacyIds.includes(pharmacyId)
                      ? 'font-medium text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {pharmacyData.name}
                  </span>
                  {selectedPharmacyIds.includes(pharmacyId) && (
                    <FiCheck className="ml-auto text-sky-500 dark:text-sky-400" size={14} />
                  )}
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Affichage du graphique selon le mode choisi */}
      {viewMode === 'total' ? (
        <ProductSalesChart 
          data={totalData} 
          isLoading={isCurrentlyLoading} 
          error={error}
          interval={interval}
          showMargin={showMargin}
        />
      ) : viewMode === 'detailed' ? (
        <ProductDetailedChart 
          data={filteredProductData} 
          isLoading={isCurrentlyLoading} 
          error={error}
          interval={interval}
          showMargin={showMargin}
        />
      ) : (
        <ProductPharmacyChart 
          data={filteredPharmacyData} 
          isLoading={isCurrentlyLoading} 
          error={error}
          interval={interval}
          showMargin={showMargin}
        />
      )}
      
      {/* Insights communs à tous les modes */}
      {totalData && totalData.length > 0 && (
        <ProductSalesInsights data={totalData} interval={interval} />
      )}
    </div>
  );
}