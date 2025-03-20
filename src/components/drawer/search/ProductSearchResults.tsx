// src/components/drawer/search/ProductSearchResults.tsx
import React from 'react';
import { FiBox, FiAlertCircle, FiLoader, FiShoppingBag, FiPackage, FiCheck } from 'react-icons/fi';

export interface Product {
  id: string;
  display_name: string;
  code_13_ref: string;
  category?: string;
  brand_lab?: string;
  universe?: string;
}

interface ProductSearchResultsProps {
  results: Product[];
  isLoading: boolean;
  error: string | null;
  selectedProducts: Product[];
  onToggleProduct: (product: Product) => void;
}

/**
 * Composant pour afficher les résultats de recherche de produits
 */
export function ProductSearchResults({ 
  results, 
  isLoading, 
  error, 
  selectedProducts,
  onToggleProduct
}: ProductSearchResultsProps) {
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

  // Vérifier si un produit est sélectionné
  const isSelected = (product: Product) => {
    return selectedProducts.some(p => p.id === product.id);
  };

  // Obtenir l'icône appropriée pour l'univers du produit
  const getUniverseIcon = (universe?: string) => {
    if (universe === 'Médicaments') {
      return <FiShoppingBag className="mr-1 text-blue-500" size={12} />;
    }
    return <FiPackage className="mr-1 text-blue-500" size={12} />;
  };

  // Affichage des résultats
  return (
    <div className="space-y-2">
      {results.map(product => (
        <div 
          key={product.id}
          className={`p-3 border ${isSelected(product) 
            ? 'border-sky-400 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/20' 
            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'} 
            rounded-lg cursor-pointer transition-colors`}
          onClick={() => onToggleProduct(product)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              {/* Icône de sélection */}
              <div className={`mr-3 p-1 rounded-full ${isSelected(product) 
                ? 'bg-sky-100 text-sky-500 dark:bg-sky-900/30 dark:text-sky-400' 
                : 'bg-gray-100 text-gray-400 dark:bg-gray-700/50 dark:text-gray-500'}`}>
                <FiCheck size={14} />
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {product.display_name}
                </h3>
                
                <div className="mt-1 text-xs flex flex-wrap gap-2">
                  {/* Code EAN13 */}
                  <span className="inline-flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-gray-700 dark:text-gray-300 font-mono">
                    {product.code_13_ref}
                  </span>
                  
                  {/* Univers */}
                  <span className="inline-flex items-center bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md text-blue-600 dark:text-blue-300">
                    {getUniverseIcon(product.universe)}
                    {product.universe || 'Autre'}
                  </span>
                  
                  {/* Laboratoire si disponible */}
                  {product.brand_lab && (
                    <span className="inline-flex items-center bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-md text-purple-600 dark:text-purple-300">
                      {product.brand_lab}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}