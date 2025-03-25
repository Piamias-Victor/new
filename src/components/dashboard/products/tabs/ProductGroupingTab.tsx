// src/components/dashboard/products/tabs/ProductGroupingTab.tsx
import React from 'react';
import { useProductGroupingComparison } from '@/hooks/useProductGroupingComparison';
import { FiTrendingUp, FiTrendingDown, FiPackage, FiRotateCw, FiShoppingCart, FiAlertCircle } from 'react-icons/fi';
import { MdEuro } from "react-icons/md";

interface ProductGroupingTabProps {
  code13ref: string;
}

export function ProductGroupingTab({ code13ref }: ProductGroupingTabProps) {
  const { price, margin, rotation, stock, sales, isLoading, error } = useProductGroupingComparison(code13ref);
  
  // Fonction pour formater les valeurs selon leur type
  const formatValue = (value: number, type: 'price' | 'margin' | 'rotation' | 'stock' | 'sales') => {
    // Détection des valeurs aberrantes (pour signalement visuel uniquement)
    const isOutlier = (val: number, type: string) => {
      switch(type) {
        case 'price':
        case 'margin':
          return val > 1000 || val < 0;
        case 'rotation':
          return val > 100 || val < -10;
        case 'stock':
        case 'sales':
          return val > 10000 || val < -100;
        default:
          return false;
      }
    };
    
    // Ajouter un avertissement pour les valeurs aberrantes
    let prefix = '';
    if (isOutlier(value, type)) {
      prefix = '! ';
    }
    
    // Formater selon le type sans limiter les valeurs
    switch(type) {
      case 'price':
      case 'margin': {
        return prefix + new Intl.NumberFormat('fr-FR', { 
          style: 'currency', 
          currency: 'EUR',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
      }
      case 'rotation': {
        return prefix + `${value.toFixed(2)}×`;
      }
      case 'stock':
      case 'sales': {
        return prefix + value.toFixed(0);
      }
      default:
        return value.toString();
    }
  };
  
  // Fonction pour obtenir la couleur en fonction de la valeur
  const getIndicatorColor = (percentage: number) => {
    if (percentage > 15) return 'text-emerald-500 dark:text-emerald-400';
    if (percentage > 5) return 'text-green-500 dark:text-green-400';
    if (percentage > -5) return 'text-blue-500 dark:text-blue-400';
    if (percentage > -15) return 'text-amber-500 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
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
        return <MdEuro size={16} />;
      case 'margin':
        return <MdEuro size={16} />;
      case 'rotation':
        return <FiRotateCw size={16} />;
      case 'stock':
        return <FiPackage size={16} />;
      case 'sales':
        return <FiShoppingCart size={16} />;
    }
  };
  
  // Formater le pourcentage
  const formatPercentage = (percentage: number) => {
    // Limiter les pourcentages extrêmes
    if (percentage > 200) return '+200%+';
    if (percentage < -200) return '-200%+';
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };
  
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-8"></div>
        <div className="grid grid-cols-5 gap-2 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mr-4"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/5 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-red-500 dark:text-red-400 p-6 bg-red-50 dark:bg-red-900/20 rounded-lg shadow">
        <div className="flex items-center mb-3">
          <FiAlertCircle className="mr-2" size={20} />
          <h3 className="text-lg font-medium">Erreur de chargement</h3>
        </div>
        <p className="text-red-600 dark:text-red-300">{error}</p>
      </div>
    );
  }
  
  const comparisonItems = [
    { 
      title: 'Prix', 
      category: 'price' as const,
      data: price,
      description: 'Prix de vente public TTC'
    },
    { 
      title: 'Marge', 
      category: 'margin' as const,
      data: margin,
      description: 'Marge brute par unité'
    },
    { 
      title: 'Rotation', 
      category: 'rotation' as const,
      data: rotation,
      description: 'Fréquence de renouvellement du stock'
    },
    { 
      title: 'Stock', 
      category: 'stock' as const,
      data: stock,
      description: 'Quantité en stock actuelle'
    },
    { 
      title: 'Ventes', 
      category: 'sales' as const,
      data: sales,
      description: 'Quantité vendue sur la période'
    }
  ];
  
  // Notice d'avertissement pour les valeurs aberrantes
  const hasAberrantValues = comparisonItems.some(item => {
    const { average, minimum, maximum } = item.data;
    return (
      (item.category === 'price' || item.category === 'margin') && (maximum > 1000 || minimum < 0) ||
      (item.category === 'rotation') && (maximum > 100 || minimum < -10) ||
      (item.category === 'stock' || item.category === 'sales') && (maximum > 10000 || minimum < -100)
    );
  });
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Comparaison au groupement
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Analyse de positionnement par rapport à la moyenne des pharmacies similaires
      </p>
      
      {hasAberrantValues && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-sm flex items-start">
          <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
          <p>
            <strong className="font-medium">Attention:</strong> Certaines valeurs aberrantes ont été détectées dans les données. 
            Veuillez signaler ce problème à l'équipe technique.
          </p>
        </div>
      )}
      
      {/* Gauge Chart - Indicators */}
      
      {/* Metrics List */}
      <div className="grid gap-4 mb-8">
        {comparisonItems.map((item, index) => {
          const indicatorColor = getIndicatorColor(item.data.percentage);
          const bgIndicatorColor = indicatorColor.replace('text-', 'bg-').replace('dark:text-', 'dark:bg-');
          return (
            <div 
              key={index} 
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 mr-4">
                  {getMetricIcon(item.category)}
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {formatValue(item.data.yourValue, item.category)}
                    <span className="mx-1 opacity-60">vs.</span>
                    {formatValue(item.data.average, item.category)} en moyenne
                  </p>
                </div>
              </div>
              
              {/* Percentage Badge */}
              <div className={`flex items-center px-3 py-1.5 rounded-full ${indicatorColor} ${bgIndicatorColor.replace('bg-', 'bg-opacity-10 ').replace('dark:bg-', 'dark:bg-opacity-15 ')}`}>
                {getTrendIcon(item.data.percentage)}
                <span className="font-semibold">{formatPercentage(item.data.percentage)}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Details Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-800 dark:text-white text-sm">Détail des métriques sur le groupement</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">Métrique</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">Minimum</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">Moyenne</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">Maximum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {comparisonItems.map((item, index) => (
                <tr 
                  key={index} 
                  className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/20'}
                >
                  <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                    <div className="flex items-center">
                      <span className="mr-2">{getMetricIcon(item.category)}</span>
                      <span>{item.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-800 dark:text-gray-200">{formatValue(item.data.minimum, item.category)}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-800 dark:text-gray-200">{formatValue(item.data.average, item.category)}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-800 dark:text-gray-200">{formatValue(item.data.maximum, item.category)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Note explicative */}
      <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
        <p>Note: Ces métriques comparent votre positionnement pour ce produit par rapport aux autres pharmacies du groupement.</p>
      </div>
    </div>
  );
}