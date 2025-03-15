// src/components/dashboard/TopProducts.tsx
import React, { useState } from 'react';
import { FiPackage, FiBarChart2, FiShoppingCart, FiTrendingUp } from 'react-icons/fi';
import { useTopProducts, SortByType, TopProduct } from '@/hooks/useTopProducts';

// Composant pour afficher le badge du taux de TVA
const TvaBadge: React.FC<{ tva: number }> = ({ tva }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
    {tva}%
  </span>
);

// Composant pour afficher une ligne de produit
interface ProductRowProps {
  product: TopProduct;
  index: number;
  sortBy: SortByType;
}

const ProductRow: React.FC<ProductRowProps> = ({ product, index, sortBy }) => {
  // Formater les montants en euros
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Formater les nombres
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(num));
  };
  
  // Déterminer quelle valeur sera mise en avant selon le critère de tri
  const getHighlightedValue = () => {
    switch (sortBy) {
      case 'quantity':
        return (
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatNumber(product.total_quantity)}
            <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400">unités</span>
          </div>
        );
      case 'margin':
        return (
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(product.total_margin)}
            <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
              ({product.margin_percentage.toFixed(1)}%)
            </span>
          </div>
        );
      default: // 'revenue'
        return (
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(product.total_revenue)}
          </div>
        );
    }
  };

  return (
    <div className="flex items-center p-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
      {/* Rang */}
      <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center ${
        index < 3 
          ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
      } mr-4 text-sm font-bold`}>
        {index + 1}
      </div>
      
      {/* Informations produit */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-base font-medium text-gray-900 dark:text-white truncate">
            {product.display_name}
          </h4>
          <TvaBadge tva={product.tva_rate} />
        </div>
        
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          {product.brand_lab && (
            <span className="truncate mr-2">
              {product.brand_lab}
            </span>
          )}
          {product.category && (
            <span className="truncate italic mr-2">
              {product.category}
            </span>
          )}
          {product.code_13_ref && (
            <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">
              {product.code_13_ref}
            </span>
          )}
        </div>
      </div>
      
      {/* Valeur mise en avant selon le tri */}
      <div className="ml-4 text-right">
        {getHighlightedValue()}
        
        {/* Afficher les autres valeurs en petit */}
        <div className="flex flex-col text-xs text-gray-500 dark:text-gray-400 mt-1">
          {sortBy !== 'revenue' && (
            <span>CA: {formatCurrency(product.total_revenue)}</span>
          )}
          {sortBy !== 'quantity' && (
            <span>Qté: {formatNumber(product.total_quantity)}</span>
          )}
          {sortBy !== 'margin' && (
            <span>Marge: {formatCurrency(product.total_margin)} ({product.margin_percentage.toFixed(1)}%)</span>
          )}
          <span className={`mt-1 ${
            product.current_stock <= 0 ? 'text-red-500 font-medium' : 
            product.current_stock < 5 ? 'text-amber-500' : 'text-emerald-500'
          }`}>
            Stock: {formatNumber(product.current_stock)}
          </span>
        </div>
      </div>
    </div>
  );
};

// Composant principal
export function TopProducts() {
  const [sortBy, setSortBy] = useState<SortByType>('revenue');
  const { byRevenue, byQuantity, isLoading, error } = useTopProducts(10);
  
  // Obtenir les produits en fonction du tri sélectionné
  const getProductsBySortType = () => {
    switch (sortBy) {
      case 'quantity': return byQuantity || [];
      default: return byRevenue || [];
    }
  };
  
  // Affichage du titre selon le critère de tri
  const getTitleBySortType = () => {
    switch (sortBy) {
      case 'quantity': return 'Top produits en volume';
      default: return 'Top produits en CA';
    }
  };
  
  // Affichage de l'icône selon le critère de tri
  const getIconBySortType = () => {
    switch (sortBy) {
      case 'quantity': return <FiShoppingCart size={20} />;
      default: return <FiBarChart2 size={20} />;
    }
  };

  // État de chargement
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
        <div className="flex justify-between mb-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded ml-4"></div>
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
        <div className="flex items-center mb-4 text-red-500 dark:text-red-400">
          <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300 mr-3">
            <FiPackage size={20} />
          </div>
          <h3 className="text-lg font-medium">Erreur de chargement des produits</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">{error}</p>
      </div>
    );
  }

  const products = getProductsBySortType();

  // Vérifier que les produits existent
  if (!products || !Array.isArray(products)) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4 text-yellow-500">
          <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300 mr-3">
            <FiPackage size={20} />
          </div>
          <h3 className="text-lg font-medium">Données produits non disponibles</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">Les données des produits n'ont pas pu être récupérées correctement.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      {/* En-tête avec titre et options */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
              {getIconBySortType()}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {getTitleBySortType()}
            </h2>
          </div>
          
          {/* Options de tri */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 inline-flex">
            <button
              onClick={() => setSortBy('revenue')}
              className={`px-3 py-1.5 text-xs font-medium rounded ${
                sortBy === 'revenue' 
                  ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              CA
            </button>
            <button
              onClick={() => setSortBy('quantity')}
              className={`px-3 py-1.5 text-xs font-medium rounded ${
                sortBy === 'quantity' 
                  ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Quantité
            </button>
          </div>
        </div>
      </div>
      
      {/* Liste des produits */}
      <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
        {products.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <FiPackage size={40} className="mx-auto mb-4 opacity-30" />
            <p>Aucun produit trouvé pour ces critères</p>
          </div>
        ) : (
          products.map((product, index) => (
            <ProductRow 
              key={product.product_id} 
              product={product} 
              index={index} 
              sortBy={sortBy} 
            />
          ))
        )}
      </div>
    </div>
  );
}