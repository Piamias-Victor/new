// src/components/dashboard/products/tabs/ProductGroupingTab.tsx
import React from 'react';
import { useProductGroupingComparison } from '@/hooks/useProductGroupingComparison';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiPackage, FiRotateCw, FiShoppingCart } from 'react-icons/fi';

interface ProductGroupingTabProps {
  code13ref: string;
}

export function ProductGroupingTab({ code13ref }: ProductGroupingTabProps) {
  const { price, margin, rotation, stock, sales, isLoading, error } = useProductGroupingComparison(code13ref);
  
  // Fonction pour formater les valeurs selon leur type
  const formatValue = (value: number, type: 'price' | 'margin' | 'rotation' | 'stock' | 'sales') => {
    switch(type) {
      case 'price':
      case 'margin':
        return new Intl.NumberFormat('fr-FR', { 
          style: 'currency', 
          currency: 'EUR',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
      case 'rotation':
        return `${value.toFixed(2)}x`;
      case 'stock':
      case 'sales':
        return value.toFixed(0);
      default:
        return value.toString();
    }
  };
  
  // Fonction pour obtenir la couleur en fonction de la valeur
  const getIndicatorColor = (percentage: number) => {
    if (percentage > 15) return 'text-emerald-500';
    if (percentage > 5) return 'text-green-500';
    if (percentage > -5) return 'text-blue-500';
    if (percentage > -15) return 'text-amber-500';
    return 'text-red-500';
  };
  
  // Fonction pour obtenir l'icône selon la tendance
  const getTrendIcon = (percentage: number) => {
    if (percentage > 0) {
      return <FiTrendingUp size={14} className="mr-1" />;
    } else if (percentage < 0) {
      return <FiTrendingDown size={14} className="mr-1" />;
    }
    return null;
  };
  
  // Obtenir les icônes pour chaque métrique
  const getMetricIcon = (category: 'price' | 'margin' | 'rotation' | 'stock' | 'sales') => {
    switch(category) {
      case 'price':
        return <FiDollarSign size={14} className="mr-1.5" />;
      case 'margin':
        return <FiDollarSign size={14} className="mr-1.5" />;
      case 'rotation':
        return <FiRotateCw size={14} className="mr-1.5" />;
      case 'stock':
        return <FiPackage size={14} className="mr-1.5" />;
      case 'sales':
        return <FiShoppingCart size={14} className="mr-1.5" />;
    }
  };
  
  // Formater le pourcentage
  const formatPercentage = (percentage: number) => {
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center border-b pb-3 border-gray-100 dark:border-gray-800">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-red-500 dark:text-red-400 text-sm p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <div className="flex items-center mb-2">
          <FiTrendingDown className="mr-2" size={16} />
          <h3 className="font-medium">Erreur de chargement</h3>
        </div>
        <p>{error}</p>
      </div>
    );
  }
  
  const comparisonItems = [
    { 
      title: 'Prix', 
      category: 'price' as const,
      data: price,
    },
    { 
      title: 'Marge', 
      category: 'margin' as const,
      data: margin,
    },
    { 
      title: 'Rotation', 
      category: 'rotation' as const,
      data: rotation,
    },
    { 
      title: 'Stock', 
      category: 'stock' as const,
      data: stock,
    },
    { 
      title: 'Ventes', 
      category: 'sales' as const,
      data: sales,
    }
  ];
  
  return (
    <div className="p-2">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
        Comparaison au groupement
      </h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Écart à la moyenne des pharmacies dans la même catégorie
      </p>
      
      {/* Gauge Chart - Indicators */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1 text-xs">
          <span className="text-red-500">-15%</span>
          <span className="text-amber-500">-5%</span>
          <span className="text-blue-500">0%</span>
          <span className="text-green-500">+5%</span>
          <span className="text-emerald-500">+15%</span>
        </div>
        <div className="h-1.5 flex rounded-full overflow-hidden">
          <div className="w-1/5 bg-red-500"></div>
          <div className="w-1/5 bg-amber-500"></div>
          <div className="w-1/5 bg-blue-500"></div>
          <div className="w-1/5 bg-green-500"></div>
          <div className="w-1/5 bg-emerald-500"></div>
        </div>
      </div>
      
      {/* Metrics List */}
      <div className="space-y-3">
        {comparisonItems.map((item, index) => {
          const indicatorColor = getIndicatorColor(item.data.percentage);
          return (
            <div 
              key={index} 
              className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center">
                <div className="flex items-center mr-2">
                  {getMetricIcon(item.category)}
                  <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                    {item.title}
                  </span>
                </div>
                
                {/* Values */}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatValue(item.data.yourValue, item.category)} vs. {formatValue(item.data.average, item.category)}
                  </span>
                </div>
              </div>
              
              {/* Percentage Badge */}
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${indicatorColor}`}>
                {getTrendIcon(item.data.percentage)}
                {formatPercentage(item.data.percentage)}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Details */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 text-xs">
        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Détail des métriques</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="text-left py-1 font-medium text-gray-500">Métrique</th>
              <th className="text-right py-1 font-medium text-gray-500">Min</th>
              <th className="text-right py-1 font-medium text-gray-500">Moy</th>
              <th className="text-right py-1 font-medium text-gray-500">Max</th>
            </tr>
          </thead>
          <tbody>
            {comparisonItems.map((item) => (
              <tr key={item.title} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-1 text-gray-700 dark:text-gray-300">{item.title}</td>
                <td className="text-right py-1 text-gray-700 dark:text-gray-300">{formatValue(item.data.minimum, item.category)}</td>
                <td className="text-right py-1 text-gray-700 dark:text-gray-300">{formatValue(item.data.average, item.category)}</td>
                <td className="text-right py-1 text-gray-700 dark:text-gray-300">{formatValue(item.data.maximum, item.category)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}