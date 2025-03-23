// src/components/dashboard/laboratories/SegmentTopProducts.tsx
import React, { useState } from 'react';
import { FiPackage, FiShoppingCart, FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import { TopProduct } from '@/hooks/useSegmentAnalysis';

type SortByType = 'revenue' | 'quantity' | 'margin';

interface SegmentTopProductsProps {
  products: TopProduct[];
  title: string;
}

export function SegmentTopProducts({ products, title }: SegmentTopProductsProps) {
  const [sortBy, setSortBy] = useState<SortByType>('revenue');

  // Fonction pour formater les montants en euros
  const formatCurrency = (amount: number) => {
    if (amount >= 10000) {
      return new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(amount);
    }
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Fonction pour formater les nombres
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(num));
  };

  // Fonction pour déterminer la couleur du stock
  const getStockColor = (stock?: number) => {
    if (stock === undefined) return 'text-gray-500 dark:text-gray-400';
    if (stock <= 0) return 'text-red-500 dark:text-red-400';
    if (stock < 5) return 'text-amber-500 dark:text-amber-400';
    return 'text-green-500 dark:text-green-400';
  };

  // Trier les produits en fonction du critère sélectionné
  const sortedProducts = [...products].sort((a, b) => {
    switch(sortBy) {
      case 'quantity':
        return b.total_quantity - a.total_quantity;
      case 'margin':
        return b.total_margin - a.total_margin;
      default: // 'revenue'
        return b.total_revenue - a.total_revenue;
    }
  });

  // Si pas de produits disponibles
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>Aucun produit trouvé</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* En-tête avec options de tri */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-end">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 inline-flex">
          <button
            onClick={() => setSortBy('revenue')}
            className={`px-3 py-1 text-xs font-medium rounded ${
              sortBy === 'revenue' 
                ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            CA
          </button>
          <button
            onClick={() => setSortBy('quantity')}
            className={`px-3 py-1 text-xs font-medium rounded ${
              sortBy === 'quantity' 
                ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            Quantité
          </button>
          <button
            onClick={() => setSortBy('margin')}
            className={`px-3 py-1 text-xs font-medium rounded ${
              sortBy === 'margin' 
                ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            Marge
          </button>
        </div>
      </div>

      {/* Liste des produits */}
      <div className="overflow-y-auto max-h-96">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedProducts.map((product, index) => (
            <div key={product.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750">
              <div className="flex items-start">
                <div className="mr-3 flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {product.display_name}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                          {product.brand_lab}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {product.code_13_ref}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1 md:mt-0 flex flex-wrap gap-2">
                      <div className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300">
                        <FiBarChart2 className="mr-1" size={12} />
                        {formatCurrency(product.total_revenue)}
                      </div>
                      <div className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <FiTrendingUp className="mr-1" size={12} />
                        <span className="mr-1">{product.margin_percentage}%</span>
                      </div>
                      <div className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        <FiShoppingCart className="mr-1" size={12} />
                        {product.total_quantity}
                      </div>
                      {product.current_stock !== undefined && (
                        <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs ${
                          product.current_stock <= 0 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : product.current_stock < 5
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          <FiPackage className="mr-1" size={12} />
                          Stock: {product.current_stock}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}