// src/components/comparison/ComparisonGapAnalysis.tsx
import React from 'react';
import { FiArrowUp, FiArrowDown, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface ComparisonGapAnalysisProps {
  itemA: any;
  itemB: any;
}

export function ComparisonGapAnalysis({ itemA, itemB }: ComparisonGapAnalysisProps) {
  // Données fictives pour la maquette - à remplacer par les données réelles
  const generateMockData = () => {
    return {
      revenueA: Math.round(100000 + Math.random() * 50000),
      revenueB: Math.round(100000 + Math.random() * 50000),
      marginA: Math.round(20 + Math.random() * 15),
      marginB: Math.round(20 + Math.random() * 15),
      growthA: Math.round(-5 + Math.random() * 20),
      growthB: Math.round(-5 + Math.random() * 20),
      stockRotationA: Math.round(3 + Math.random() * 5),
      stockRotationB: Math.round(3 + Math.random() * 5),
      stockValueA: Math.round(30000 + Math.random() * 20000),
      stockValueB: Math.round(30000 + Math.random() * 20000),
    };
  };

  const data = generateMockData();
  
  // Calcul des écarts
  const calculateGap = (valueA, valueB) => {
    const absoluteGap = valueA - valueB;
    const percentageGap = valueB !== 0 ? (absoluteGap / valueB) * 100 : 0;
    
    return {
      absolute: absoluteGap,
      percentage: percentageGap,
      isPositive: absoluteGap > 0
    };
  };
  
  // Formatage des valeurs selon leur type
  const formatValue = (value, type) => {
    switch (type) {
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
  
  // Préparation des métriques à afficher
  const metrics = [
    {
      id: 'revenue',
      label: 'Chiffre d\'affaires',
      valueA: data.revenueA,
      valueB: data.revenueB,
      format: 'currency',
      gap: calculateGap(data.revenueA, data.revenueB)
    },
    {
      id: 'margin',
      label: 'Taux de marge',
      valueA: data.marginA,
      valueB: data.marginB,
      format: 'percentage',
      gap: calculateGap(data.marginA, data.marginB)
    },
    {
      id: 'growth',
      label: 'Croissance',
      valueA: data.growthA,
      valueB: data.growthB,
      format: 'percentage',
      gap: calculateGap(data.growthA, data.growthB)
    },
    {
      id: 'stockRotation',
      label: 'Rotation du stock',
      valueA: data.stockRotationA,
      valueB: data.stockRotationB,
      format: 'number',
      gap: calculateGap(data.stockRotationA, data.stockRotationB)
    },
    {
      id: 'stockValue',
      label: 'Valeur du stock',
      valueA: data.stockValueA,
      valueB: data.stockValueB,
      format: 'currency',
      gap: calculateGap(data.stockValueA, data.stockValueB)
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 mr-3">
            <FiTrendingUp size={18} />
          </div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Analyse des Écarts
          </h2>
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          {metrics.map(metric => (
            <div 
              key={metric.id} 
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {metric.label}
                </h3>
                <div className={`flex items-center ${
                  metric.gap.isPositive 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {metric.gap.isPositive ? (
                    <FiArrowUp size={16} className="mr-1" />
                  ) : (
                    <FiArrowDown size={16} className="mr-1" />
                  )}
                  <span className="text-sm font-medium">
                    {Math.abs(metric.gap.percentage).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="relative pt-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="inline-flex items-center">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 mr-1 text-xs font-bold">
                      A
                    </span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {formatValue(metric.valueA, metric.format)}
                    </span>
                  </div>
                  <div className="inline-flex items-center">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {formatValue(metric.valueB, metric.format)}
                    </span>
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 ml-1 text-xs font-bold">
                      B
                    </span>
                  </div>
                </div>
                
                <div className="flex h-2 mb-2 rounded overflow-hidden">
                  {/* Barre A */}
                  <div 
                    className={`flex flex-col justify-center rounded-l ${
                      metric.valueA > metric.valueB ? 'bg-blue-500' : 'bg-blue-400'
                    }`}
                    style={{ 
                      width: `${(metric.valueA / Math.max(metric.valueA, metric.valueB)) * 50}%` 
                    }}
                  ></div>
                  
                  {/* Barre B */}
                  <div 
                    className={`flex flex-col justify-center rounded-r ${
                      metric.valueB > metric.valueA ? 'bg-green-500' : 'bg-green-400'
                    }`}
                    style={{ 
                      width: `${(metric.valueB / Math.max(metric.valueA, metric.valueB)) * 50}%` 
                    }}
                  ></div>
                </div>
                
                <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                  {metric.gap.isPositive ? (
                    <>A supérieur de {formatValue(Math.abs(metric.gap.absolute), metric.format)}</>
                  ) : (
                    <>B supérieur de {formatValue(Math.abs(metric.gap.absolute), metric.format)}</>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Comparaison basée sur les données des 3 derniers mois
        </p>
      </div>
    </div>
  );
}