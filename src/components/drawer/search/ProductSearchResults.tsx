// src/components/drawer/search/ProductSearchResults.tsx
import React from 'react';
import { FiBox, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { Product } from '@/services/productService';

interface ProductSearchResultsProps {
  results: Product[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Composant pour afficher les résultats de recherche de produits
 */
export function ProductSearchResults({ results, isLoading, error }: ProductSearchResultsProps) {
  // État de chargement
  if (isLoading) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <FiLoader className="animate-spin mb-3" size={24} />
        <p>Recherche en cours...</p>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-red-500 dark:text-red-400">
        <FiAlertCircle className="mb-3" size={24} />
        <p>{error}</p>
      </div>
    );
  }

  // Aucun résultat
  if (results.length === 0) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <FiBox className="mb-3" size={24} />
        <p>Aucun produit trouvé</p>
        <p className="text-sm">Essayez de modifier votre recherche</p>
      </div>
    );
  }

  // Affichage des résultats
  return (
    <div className="space-y-2">
      {results.map(product => (
        <div 
          key={product.id || product.product_id}
          className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {product.display_name || product.name}
              </h3>
              
              <div className="mt-1 text-xs flex flex-wrap gap-2">
                {/* Code EAN13 */}
                <span className="inline-flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-gray-700 dark:text-gray-300 font-mono">
                  {product.ean || product.code_13_ref}
                </span>
                
                {/* Catégorie si disponible */}
                {product.category && (
                  <span className="inline-flex items-center bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md text-blue-600 dark:text-blue-300">
                    {product.category}
                  </span>
                )}
                
                {/* Laboratoire si disponible */}
                {product.brand_lab && (
                  <span className="inline-flex items-center bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-md text-purple-600 dark:text-purple-300">
                    {product.brand_lab}
                  </span>
                )}
              </div>
            </div>
            
            {/* Informations complémentaires à droite */}
            <div className="text-right">
              {product.price_with_tax !== undefined && (
                <div className="font-bold text-gray-900 dark:text-white">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.price_with_tax)}
                </div>
              )}
              
              {product.current_stock !== undefined && (
                <div className={`text-sm ${
                  product.current_stock <= 0 ? 'text-red-500 dark:text-red-400' :
                  product.current_stock < 5 ? 'text-amber-500 dark:text-amber-400' :
                  'text-green-500 dark:text-green-400'
                }`}>
                  Stock: {product.current_stock}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}