// src/components/products/stock/StockPredictionsCard.tsx
import React from 'react';
import { FiAlertTriangle, FiTrendingDown, FiAlertCircle } from 'react-icons/fi';

interface StockPredictionsCardProps {
  ruptureTreshold: number;
  forecastedStockDate: string;
  stockoutRisk: 'low' | 'medium' | 'high' | 'critical';
  stockoutRiskDate: string | null;
  currentStock: number;
  isLoading?: boolean;
}

export function StockPredictionsCard({
  ruptureTreshold,
  forecastedStockDate,
  stockoutRisk,
  stockoutRiskDate,
  currentStock,
  isLoading = false
}: StockPredictionsCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/5 mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Formatage de la date pour affichage
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Indéterminée';
    
    // Convertir en format français JJ/MM/YYYY
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };
  
  // Calculer le délai en jours jusqu'à la rupture
  const calculateDaysUntilStockout = () => {
    if (!stockoutRiskDate) return null;
    
    const today = new Date();
    const stockoutDate = new Date(stockoutRiskDate);
    const diffTime = stockoutDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  const daysUntilStockout = calculateDaysUntilStockout();

  // Déterminer la couleur et l'icône en fonction du risque
  const getRiskStatusInfo = () => {
    switch (stockoutRisk) {
      case 'critical':
        return {
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          borderColor: 'border-red-200 dark:border-red-800',
          icon: <FiAlertTriangle size={24} />,
          text: 'Rupture critique'
        };
      case 'high':
        return {
          color: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-100 dark:bg-amber-900/30',
          borderColor: 'border-amber-200 dark:border-amber-800',
          icon: <FiAlertCircle size={24} />,
          text: 'Risque élevé'
        };
      case 'medium':
        return {
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          icon: <FiAlertCircle size={24} />,
          text: 'Risque modéré'
        };
      default:
        return {
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          borderColor: 'border-green-200 dark:border-green-800',
          icon: <FiTrendingDown size={24} />,
          text: 'Risque faible'
        };
    }
  };
  
  const riskInfo = getRiskStatusInfo();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Prévisions et risques
      </h3>
      
      <div className={`p-4 rounded-lg border ${riskInfo.borderColor} ${riskInfo.bgColor} mb-4`}>
        <div className="flex items-center">
          <div className={`${riskInfo.color} mr-3`}>
            {riskInfo.icon}
          </div>
          <div>
            <h4 className={`font-medium ${riskInfo.color}`}>
              {riskInfo.text}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentStock === 0 ? (
                <span className="font-medium">Produit actuellement en rupture</span>
              ) : daysUntilStockout ? (
                <span>
                  Rupture estimée dans {daysUntilStockout} jours
                  {stockoutRiskDate && ` (${formatDate(stockoutRiskDate)})`}
                </span>
              ) : (
                <span>Aucune rupture prévue à court terme</span>
              )}
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Seuil de rupture</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {ruptureTreshold} unités
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Date prévue de rupture</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {formatDate(stockoutRiskDate)}
          </span>
        </div>
      </div>
    </div>
  );
}