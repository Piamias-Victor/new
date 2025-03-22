// src/components/products/tabs/ProductEvolutionTab.tsx
import React from 'react';
import { ProductDetailData } from '@/hooks/useSelectedProductsData';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface ProductEvolutionTabProps {
  product: ProductDetailData;
}

export function ProductEvolutionTab({ product }: ProductEvolutionTabProps) {
  // Fonction pour formatter les valeurs monétaires
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 2 
    }).format(amount);
  };
  
  // Formater le pourcentage avec signe
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${Number(value).toFixed(1)}%`;
  };
  
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        Évolution des ventes
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Évolution des ventes</p>
          <div className="flex items-center">
            {product.sales_evolution_percentage > 0 ? (
              <>
                <FiTrendingUp className="text-green-500 mr-1" size={16} />
                <p className="text-base font-medium text-green-500">{formatPercentage(product.sales_evolution_percentage)}</p>
              </>
            ) : product.sales_evolution_percentage < 0 ? (
              <>
                <FiTrendingDown className="text-red-500 mr-1" size={16} />
                <p className="text-base font-medium text-red-500">{formatPercentage(product.sales_evolution_percentage)}</p>
              </>
            ) : (
              <p className="text-base font-medium text-gray-900 dark:text-white">0%</p>
            )}
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Ventes période précédente</p>
          <p className="text-base font-medium text-gray-900 dark:text-white">{product.previous_sales_quantity} unités</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Ventes période actuelle</p>
          <p className="text-base font-medium text-gray-900 dark:text-white">{product.sales_quantity} unités</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Différence absolue</p>
          <p className="text-base font-medium text-gray-900 dark:text-white">
            {product.sales_quantity - product.previous_sales_quantity} unités
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-500">Les graphiques d'évolution détaillés seront disponibles prochainement.</p>
    </div>
  );
}