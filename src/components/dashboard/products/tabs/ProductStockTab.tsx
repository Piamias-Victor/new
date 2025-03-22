// src/components/products/tabs/ProductStockTab.tsx
import React from 'react';
import { ProductDetailData } from '@/hooks/useSelectedProductsData';

interface ProductStockTabProps {
  product: ProductDetailData;
}

export function ProductStockTab({ product }: ProductStockTabProps) {
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
        Données de stock
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Stock actuel</p>
          <p className="text-base font-medium text-gray-900 dark:text-white">{product.stock_quantity} unités</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Valeur du stock (HT)</p>
          <p className="text-base font-medium text-gray-900 dark:text-white">{formatCurrency(product.stock_value_ht)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Prix d'achat unitaire (HT)</p>
          <p className="text-base font-medium text-gray-900 dark:text-white">{formatCurrency(product.sell_in_price_ht)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Couverture de stock</p>
          <p className="text-base font-medium text-gray-900 dark:text-white">
            {product.sales_quantity > 0 
              ? `${(product.stock_quantity / (product.sales_quantity / 30)).toFixed(1)} jours` 
              : 'Non calculable'}
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-500">L'historique détaillé des stocks sera disponible prochainement.</p>
    </div>
  );
}