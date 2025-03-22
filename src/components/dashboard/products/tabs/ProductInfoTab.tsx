// src/components/products/tabs/ProductInfoTab.tsx
import React from 'react';
import { ProductDetailData } from '@/hooks/useSelectedProductsData';

interface ProductInfoTabProps {
  product: ProductDetailData;
}

export function ProductInfoTab({ product }: ProductInfoTabProps) {
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
        Informations produit
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Nom du produit</p>
          <p className="text-base font-medium text-gray-900 dark:text-white">{product.display_name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Code EAN</p>
          <p className="text-base font-mono text-gray-900 dark:text-white">{product.code_13_ref}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Laboratoire</p>
          <p className="text-base text-gray-900 dark:text-white">{product.brand_lab || 'Non spécifié'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Prix de vente TTC</p>
          <p className="text-base text-gray-900 dark:text-white">{formatCurrency(product.sell_out_price_ttc)}</p>
        </div>
      </div>
    </div>
  );
}