// src/components/products/tabs/ProductSalesTab.tsx
import React from 'react';
import { ProductDetailData } from '@/hooks/useSelectedProductsData';

interface ProductSalesTabProps {
  product: ProductDetailData;
}

export function ProductSalesTab({ product }: ProductSalesTabProps) {
  // Fonction pour formatter les valeurs monétaires
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 2 
    }).format(amount);
  };
  
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        Données de vente
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Ventes totales</p>
          <p className="text-base font-medium text-gray-900 dark:text-white">{product.sales_quantity} unités</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">CA TTC réalisé</p>
          <p className="text-base font-medium text-gray-900 dark:text-white">{formatCurrency(product.total_sell_out)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Marge totale</p>
          <p className="text-base font-medium text-gray-900 dark:text-white">{formatCurrency(product.margin_amount * product.sales_quantity)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Prix moyen de vente</p>
          <p className="text-base font-medium text-gray-900 dark:text-white">{formatCurrency(product.sell_out_price_ttc)}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500">Les données détaillées des ventes seront disponibles prochainement.</p>
    </div>
  );
}