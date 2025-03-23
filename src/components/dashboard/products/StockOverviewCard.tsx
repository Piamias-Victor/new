// src/components/products/stock/StockOverviewCard.tsx
import React from 'react';
import { FiPackage, FiCalendar, FiRotateCw } from 'react-icons/fi';

interface StockOverviewCardProps {
  currentStock: number;
  daysOfStock: number;
  monthsOfStock: number;
  rotationRate: number;
  stockValue: number;
  isLoading?: boolean;
}

export function StockOverviewCard({
  currentStock,
  daysOfStock,
  monthsOfStock,
  rotationRate,
  stockValue,
  isLoading = false
}: StockOverviewCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Formater le montant en euros
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Déterminer la couleur de l'indicateur de stock
  const getStockStatusColor = (days: number) => {
    if (days <= 0) return 'text-red-500 dark:text-red-400';
    if (days < 15) return 'text-amber-500 dark:text-amber-400';
    if (days < 30) return 'text-yellow-500 dark:text-yellow-400';
    if (days <= 90) return 'text-green-500 dark:text-green-400';
    return 'text-blue-500 dark:text-blue-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Aperçu du stock
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 mr-3">
            <FiPackage size={20} />
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Stock actuel
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {currentStock} unités
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Valeur: {formatCurrency(stockValue)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mr-3">
            <FiCalendar size={20} />
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Couverture de stock
            </div>
            <div className={`text-xl font-bold ${getStockStatusColor(daysOfStock)}`}>
              {Number(monthsOfStock).toFixed(1)} mois
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {daysOfStock} jours de stock
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-3">
            <FiRotateCw size={20} />
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Rotation du stock
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {Number(rotationRate).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              sur 90 jours
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}