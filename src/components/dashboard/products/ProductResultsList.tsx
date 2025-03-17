// src/components/dashboard/products/ProductResultsList.tsx
import React from 'react';
import Link from 'next/link';
import { FiPackage, FiTrendingUp, FiBox, FiBarChart, FiEye } from 'react-icons/fi';
import { Product } from '@/services/productService';

interface ProductResultsListProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

export function ProductResultsList({ products, isLoading, error }: ProductResultsListProps) {
  // Fonction pour formater le prix
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount);
  };

  // État de chargement
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Résultats de recherche
          </h3>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Résultats de recherche
          </h3>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          <p>Erreur: {error}</p>
        </div>
      </div>
    );
  }

  // Pas de résultats
  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Résultats de recherche
          </h3>
        </div>
        <div className="text-center py-8">
          <FiPackage className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Aucun produit trouvé.</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Essayez de modifier vos critères de recherche.</p>
        </div>
      </div>
    );
  }

  // Résultats trouvés
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Résultats de recherche ({products.length})
        </h3>
      </div>
      
      <div className="space-y-4">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-3 md:mb-0">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  {product.display_name || product.name}
                </h4>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-300">
                  {product.code_13_ref && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      <FiBox className="mr-1" size={12} /> 
                      {product.code_13_ref}
                    </span>
                  )}
                  {product.category && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {product.category}
                    </span>
                  )}
                  {product.brand_lab && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      {product.brand_lab}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Prix TTC</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(product.price_with_tax)}
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Stock</div>
                  <div className={`font-medium ${
                    product.current_stock === 0 
                      ? 'text-red-600 dark:text-red-400' 
                      : product.current_stock && product.current_stock < 5 
                        ? 'text-amber-600 dark:text-amber-400' 
                        : 'text-green-600 dark:text-green-400'
                  }`}>
                    {product.current_stock !== undefined ? product.current_stock : 'N/A'}
                  </div>
                </div>
                
                <Link
                  href={`/dashboard/products/${product.id}`}
                  className="inline-flex items-center px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  <FiEye className="mr-1" size={16} />
                  Détails
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}