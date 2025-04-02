// src/components/dashboard/TopProducts.tsx - Modifié pour le filtrage EAN et l'export CSV
import React, { useState } from 'react';
import { FiPackage, FiBarChart2, FiShoppingCart, FiTrendingUp, FiDownload } from 'react-icons/fi';
import { useTopProducts, SortByType, TopProduct } from '@/hooks/useTopProducts';
import { useProductFilter } from '@/contexts/ProductFilterContext'; // Ajouté pour accéder au contexte de filtrage
import { FilterBadge } from '@/components/filters/FilterBadge'; // Composant pour afficher le badge de filtrage

// Composant pour afficher le badge du taux de TVA
const TvaBadge: React.FC<{ tva: number }> = ({ tva }) => {
  // Déterminer si le taux est déjà en pourcentage ou en décimal
  // Si le taux est > 1, on suppose qu'il est déjà en pourcentage (ex: 5.5, 20)
  // Sinon, on le considère comme un décimal (ex: 0.055, 0.2) et on le convertit
  const formatTVA = (tvaRate: number) => {
    if (tvaRate === 0) return "0%";
    
    // Si déjà en pourcentage (ex: 5.5, 20)
    if (tvaRate > 1) {
      return `${tvaRate}%`;
    }
    
    // Si en décimal (ex: 0.055, 0.2), convertir en pourcentage
    return `${(tvaRate * 100)}%`;
  };

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
      {formatTVA(tva)}
    </span>
  );
};

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
              ({product.margin_percentage}%)
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
            <span>Marge: {formatCurrency(product.total_margin)} ({product.margin_percentage}%)</span>
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
  const { byRevenue, byQuantity, byMargin, isLoading, error } = useTopProducts(100);
  const { isFilterActive, selectedCodes } = useProductFilter(); // Accès au contexte de filtrage
  const [isExporting, setIsExporting] = useState(false);
  
  // Obtenir les produits en fonction du tri sélectionné
  const getProductsBySortType = () => {
    switch (sortBy) {
      case 'quantity': return byQuantity || [];
      case 'margin': return byMargin || [];
      default: return byRevenue || [];
    }
  };
  
  // Affichage du titre selon le critère de tri
  const getTitleBySortType = () => {
    switch (sortBy) {
      case 'quantity': return 'Top produits en volume';
      case 'margin': return 'Top produits en marge';
      default: return 'Top produits en CA';
    }
  };
  
  // Affichage de l'icône selon le critère de tri
  const getIconBySortType = () => {
    switch (sortBy) {
      case 'quantity': return <FiShoppingCart size={20} />;
      case 'margin': return <FiTrendingUp size={20} />;
      default: return <FiBarChart2 size={20} />;
    }
  };

  // Formatage pour l'export
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(num));
  };

  // Fonction pour exporter les données en CSV
  const exportToCSV = () => {
    const products = getProductsBySortType();
    if (!products || products.length === 0) return;
    
    setIsExporting(true);
    
    try {
      // Préparer les données pour l'export
      const exportData = products.map((product, index) => ({
        'Rang': index + 1,
        'Produit': product.display_name,
        'Code EAN': product.code_13_ref || '',
        'Laboratoire': product.brand_lab || '',
        'Catégorie': product.category || '',
        'CA': product.total_revenue,
        'Quantité vendue': product.total_quantity,
        'Marge (€)': product.total_margin,
        'Marge (%)': product.margin_percentage,
        'Stock actuel': product.current_stock,
        'TVA (%)': product.tva_rate > 1 ? product.tva_rate : product.tva_rate * 100
      }));
      
      // Convertir en CSV
      const headers = Object.keys(exportData[0]).join(';');
      const csvData = exportData.map(row => {
        return Object.values(row).map(value => {
          // Gérer les nombres pour assurer la compatibilité Excel français (virgule décimale)
          if (typeof value === 'number') {
            return String(value).replace('.', ',');
          }
          // Échapper les valeurs contenant des points-virgules
          if (typeof value === 'string' && value.includes(';')) {
            return `"${value}"`;
          }
          return value;
        }).join(';');
      }).join('\n');
      
      const csvContent = `${headers}\n${csvData}`;
      
      // Créer un blob et un lien de téléchargement
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Configurer et déclencher le téléchargement
      const fileName = sortBy === 'quantity' ? 'top_produits_volume' : 
                       sortBy === 'margin' ? 'top_produits_marge' : 
                       'top_produits_ca';
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `${fileName}_${date}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur lors de l\'exportation:', error);
      alert('Une erreur est survenue lors de l\'exportation. Veuillez réessayer.');
    } finally {
      setIsExporting(false);
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
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {getTitleBySortType()}
              </h3>
              <div className="flex items-center gap-2">
                {/* Ajout du badge de filtrage si le filtre est actif */}
                {isFilterActive && <FilterBadge count={selectedCodes.length} size="sm" />}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            {/* Bouton d'export CSV */}
            <button
              onClick={exportToCSV}
              disabled={isExporting || !products || products.length === 0}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center ${
                isExporting || !products || products.length === 0
                  ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
              }`}
            >
              <FiDownload className="mr-1" size={14} />
              {isExporting ? 'Exportation...' : 'CSV'}
            </button>
            
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
                Qte
              </button>
              <button
                onClick={() => setSortBy('margin')}
                className={`px-3 py-1.5 text-xs font-medium rounded ${
                  sortBy === 'margin' 
                    ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                Marge
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Liste des produits */}
      <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
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