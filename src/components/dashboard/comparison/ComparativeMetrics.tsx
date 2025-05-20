// src/components/comparison/ComparativeMetrics.tsx
import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus, FiPackage, FiShoppingBag, FiPercent, FiBarChart2 } from 'react-icons/fi';
import { MdEuro } from 'react-icons/md';

interface ComparativeMetricsProps {
  itemA: any;
  itemB: any;
}

export function ComparativeMetrics({ itemA, itemB }: ComparativeMetricsProps) {
  // Cette fonction serait alimentée par des données réelles dans l'implémentation finale
  const calculateDifference = (valueA, valueB) => {
    const diff = valueA - valueB;
    const percentage = valueB !== 0 ? (diff / valueB) * 100 : 0;
    
    return {
      absolute: diff,
      percentage: percentage,
      isPositive: diff > 0
    };
  };

  // Pour la maquette, utilisons des données fictives
  const metrics = [
    {
      id: 'revenue',
      label: 'CA Sell-out',
      icon: <MdEuro size={18} />,
      valueA: 125600,
      valueB: 98400,
      format: 'currency',
      bgColorClass: 'bg-sky-50 dark:bg-sky-900/20',
    },
    {
      id: 'margin',
      label: 'Marge',
      icon: <FiPercent size={18} />,
      valueA: 32.5,
      valueB: 28.7,
      format: 'percentage',
      bgColorClass: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      id: 'quantity',
      label: 'Unités vendues',
      icon: <FiShoppingBag size={18} />,
      valueA: 3850,
      valueB: 4210,
      format: 'number',
      bgColorClass: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      id: 'stock',
      label: 'Stock actuel',
      icon: <FiPackage size={18} />,
      valueA: 456,
      valueB: 312,
      format: 'number',
      bgColorClass: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      id: 'references',
      label: 'Références',
      icon: <FiBarChart2 size={18} />,
      valueA: 24,
      valueB: 18,
      format: 'number',
      bgColorClass: 'bg-indigo-50 dark:bg-indigo-900/20',
    }
  ];

  // Formatage des valeurs selon leur type
  const formatValue = (value, format) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('fr-FR', { 
          style: 'currency', 
          currency: 'EUR',
          maximumFractionDigits: 0
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
      default:
        return new Intl.NumberFormat('fr-FR').format(value);
    }
  };

  // Obtenir l'icône de tendance en fonction de la différence
  const getTrendIcon = (diff) => {
    if (diff.percentage > 1) {
      return <FiTrendingUp className="text-green-500 dark:text-green-400" size={18} />;
    } else if (diff.percentage < -1) {
      return <FiTrendingDown className="text-red-500 dark:text-red-400" size={18} />;
    } else {
      return <FiMinus className="text-gray-500 dark:text-gray-400" size={18} />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Métriques Comparatives
        </h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {metrics.map(metric => {
            const diff = calculateDifference(metric.valueA, metric.valueB);
            
            return (
              <div key={metric.id} className={`${metric.bgColorClass} rounded-lg p-4`}>
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-full bg-white dark:bg-gray-700 mr-3">
                    {metric.icon}
                  </div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.label}
                  </h3>
                </div>
                
                <div className="grid grid-cols-12 gap-2">
                  {/* Valeur A */}
                  <div className="col-span-5">
                    <div className="flex items-center justify-center h-8 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 mb-1">
                      <span className="text-xs font-bold">A</span>
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatValue(metric.valueA, metric.format)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Différence */}
                  <div className="col-span-2 flex items-center justify-center">
                    {getTrendIcon(diff)}
                  </div>
                  
                  {/* Valeur B */}
                  <div className="col-span-5">
                    <div className="flex items-center justify-center h-8 rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 mb-1">
                      <span className="text-xs font-bold">B</span>
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatValue(metric.valueB, metric.format)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-center">
                  <span className={`text-xs font-medium ${
                    diff.isPositive 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {diff.isPositive ? '+' : ''}{diff.percentage.toFixed(1)}%
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      ({formatValue(diff.absolute, metric.format)})
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}