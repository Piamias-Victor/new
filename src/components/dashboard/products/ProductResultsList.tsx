// src/components/dashboard/products/ProductResultsList.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { FiPackage, FiTrendingUp, FiBox, FiDollarSign, FiEye, FiFilter, FiAlertCircle, FiCheck, FiSearch, FiChevronDown, FiChevronUp, FiHome } from 'react-icons/fi';
import { Product } from '@/services/productService';

interface ProductResultsListProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

// Composant pour afficher un badge
interface BadgeProps {
  text: string;
  color: string;
  icon?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ text, color, icon }) => {
  let bgClass = '';
  let textClass = '';
  
  switch (color) {
    case 'blue':
      bgClass = 'bg-blue-100 dark:bg-blue-900/30';
      textClass = 'text-blue-800 dark:text-blue-300';
      break;
    case 'green':
      bgClass = 'bg-green-100 dark:bg-green-900/30';
      textClass = 'text-green-800 dark:text-green-300';
      break;
    case 'yellow':
      bgClass = 'bg-amber-100 dark:bg-amber-900/30';
      textClass = 'text-amber-800 dark:text-amber-300';
      break;
    case 'red':
      bgClass = 'bg-red-100 dark:bg-red-900/30';
      textClass = 'text-red-800 dark:text-red-300';
      break;
    case 'gray':
    default:
      bgClass = 'bg-gray-100 dark:bg-gray-700';
      textClass = 'text-gray-800 dark:text-gray-200';
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgClass} ${textClass}`}>
      {icon && <span className="mr-1">{icon}</span>}
      {text}
    </span>
  );
};

export function ProductResultsList({ products, isLoading, error }: ProductResultsListProps) {
  const [expandedView, setExpandedView] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('name'); // Options: name, price, stock
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Fonction pour formater le prix
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount);
  };
  
  // Fonction pour calculer correctement la marge avec TVA
  const calculateMarginPercentage = (priceTTC: number | undefined, priceHT: number | undefined, tvaRate: number | undefined) => {
    if (!priceTTC || !priceHT || tvaRate === undefined || priceHT === 0) return 'N/A';
    
    // Prix de vente HT = Prix TTC / (1 + TVA/100)
    const priceVenteHT = priceTTC / (1 + tvaRate / 100);
    
    // Marge HT = Prix de vente HT - Prix d'achat HT
    const margeHT = priceVenteHT - priceHT;
    
    // Pourcentage de marge = (Marge HT / Prix d'achat HT) * 100
    const pourcentageMarge = (margeHT / priceHT) * 100;
    
    return pourcentageMarge.toFixed(2) + '%';
  };
  
  // Fonction pour changer le tri
  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Inverser l'ordre si on clique sur le même champ
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Nouveau champ, ordre par défaut
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  // Trier les produits
  const sortedProducts = [...products].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'price':
        comparison = ((a.price_with_tax || 0) - (b.price_with_tax || 0));
        break;
      case 'stock':
        comparison = ((a.current_stock || 0) - (b.current_stock || 0));
        break;
      default:
        // Par défaut, trier par nom
        comparison = (a.display_name || a.name).localeCompare(b.display_name || b.name);
    }
    
    // Inverser pour ordre descendant
    return sortOrder === 'asc' ? comparison : -comparison;
  });

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
          <div className="flex items-center">
            <FiAlertCircle className="mr-2 flex-shrink-0" size={18} />
            <p>Erreur: {error}</p>
          </div>
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
        <div className="text-center py-10">
          <FiSearch className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun produit trouvé</h4>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Essayez de modifier vos critères de recherche ou d'utiliser des termes plus généraux.
          </p>
        </div>
      </div>
    );
  }

  // Résultats trouvés
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
              <FiPackage size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Résultats ({products.length})
            </h3>
          </div>
          
          <div className="flex space-x-2">            
            {/* Menu de tri */}
            <div className="relative inline-flex bg-gray-100 dark:bg-gray-700 rounded-lg">
              <button
                onClick={() => handleSort('name')}
                className={`px-3 py-1.5 text-sm rounded-l-lg ${
                  sortBy === 'name' 
                    ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Nom {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSort('price')}
                className={`px-3 py-1.5 text-sm ${
                  sortBy === 'price' 
                    ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Prix {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSort('stock')}
                className={`px-3 py-1.5 text-sm rounded-r-lg ${
                  sortBy === 'stock' 
                    ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Stock {sortBy === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-[60vh]">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedProducts.map((product) => (
            <div 
              key={product.id} 
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-3 md:mb-0 md:mr-4 flex-1">
                  <div className="flex items-start md:items-center">
                    <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 mr-3">
                      <FiBox size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {product.display_name || product.name}
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {product.code_13_ref && (
                          <Badge 
                            text={product.code_13_ref} 
                            color="gray" 
                            icon={<FiBox size={12} />} 
                          />
                        )}
                        {product.category && (
                          <Badge text={product.category} color="blue" />
                        )}
                        {product.brand_lab && (
                          <Badge text={product.brand_lab} color="green" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Informations supplémentaires en mode étendu */}
                  {expandedView && (
                    <div className="ml-12 mt-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="flex items-center">
                          <FiDollarSign className="mr-1 text-gray-400" size={14} />
                          <span>TVA: {product.tva_rate ? `${product.tva_rate}%` : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Prix TTC</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(product.price_with_tax)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Prix d'achat</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(product.weighted_average_price)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Marge</div>
                    <div className="font-medium text-emerald-600 dark:text-emerald-400">
                      {calculateMarginPercentage(product.price_with_tax, product.weighted_average_price, product.tva_rate)}
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
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Pharmacies en stock</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {product.pharmacies_with_stock || 0} / {product.pharmacy_count || 0}
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