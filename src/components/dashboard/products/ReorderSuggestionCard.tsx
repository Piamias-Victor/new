// src/components/products/stock/ReorderSuggestionCard.tsx
import React from 'react';
import { FiShoppingBag, FiTruck } from 'react-icons/fi';

interface ReorderSuggestionCardProps {
  optimalStock: number;
  currentStock: number;
  suggestedOrderQuantity: number;
  isLoading?: boolean;
}

export function ReorderSuggestionCard({
  optimalStock,
  currentStock,
  suggestedOrderQuantity,
  isLoading = false
}: ReorderSuggestionCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/5 mb-4"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center mb-4">
        <FiTruck className="text-gray-500 dark:text-gray-400 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Suggestion de réapprovisionnement
        </h3>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300">
            <FiShoppingBag size={20} />
          </div>
          <div>
            <h4 className="font-medium text-blue-700 dark:text-blue-300">
              Opportunité de commande
            </h4>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {suggestedOrderQuantity > 0 ? (
                `Nous suggérons de commander ${suggestedOrderQuantity} unités pour optimiser votre stock.`
              ) : (
                `Le stock actuel est suffisant. Aucune commande n'est nécessaire pour le moment.`
              )}
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Stock actuel</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">{currentStock} unités</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Stock optimal</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">{optimalStock} unités</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Quantité à commander</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">{suggestedOrderQuantity} unités</span>
        </div>
      </div>
    </div>
  );
}