// src/components/products/SelectedProductsList.tsx
import React, { useState, useMemo } from 'react';
import { useSelectedProductsData } from '@/hooks/useSelectedProductsData';
import { 
  FiPackage, 
  FiSearch, 
  FiArrowUp, 
  FiArrowDown, 
  FiRefreshCw, 
  FiTrendingUp, 
  FiTrendingDown,
  FiInfo,
  FiChevronDown
} from 'react-icons/fi';
import { ProductInfoTab } from './tabs/ProductInfoTab';
import { ProductSalesTab } from './tabs/ProductSalesTab';
import { ProductStockTab } from './tabs/ProductStockTab';
import { ProductEvolutionTab } from './tabs/ProductEvolutionTab';

type SortField = 'display_name' | 'brand_lab' | 'sell_out_price_ttc' | 'sell_in_price_ht' | 'margin_percentage' | 
                'stock_value_ht' | 'sales_quantity' | 'sales_evolution_percentage';

type TabKey = 'info' | 'sales' | 'stock' | 'evolution';

export function SelectedProductsList() {
  const { products, isLoading, error } = useSelectedProductsData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('display_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showTotals, setShowTotals] = useState(true);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  
  // Fonction pour formatter les valeurs monétaires
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 2 
    }).format(amount);
  };
  
  // Fonction pour formatter les pourcentages
  const formatPercentage = (value: number) => {
    return `${Number(value).toFixed(2)} %`;
  };
  
  // Gestion du tri
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Gestion de l'affichage des détails
  const toggleDetails = (productId: string) => {
    setExpandedProductId(expandedProductId === productId ? null : productId);
    setActiveTab('info'); // Réinitialiser l'onglet actif
  };
  
  // Filtrage des produits en fonction de la recherche
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    
    const term = searchTerm.toLowerCase();
    return products.filter(product => 
      product.display_name.toLowerCase().includes(term) || 
      product.code_13_ref.includes(term) ||
      (product.brand_lab && product.brand_lab.toLowerCase().includes(term))
    );
  }, [products, searchTerm]);
  
  // Tri des produits
  // Modifiez la fonction de tri dans votre composant SelectedProductsList
// Remplacez la partie du tri des produits par ce code :

// Tri des produits
const sortedProducts = useMemo(() => {
  return [...filteredProducts].sort((a, b) => {
    let compareResult;
    
    switch (sortField) {
      case 'display_name':
        compareResult = a.display_name.localeCompare(b.display_name);
        break;
      case 'brand_lab':
        compareResult = (a.brand_lab || '').localeCompare(b.brand_lab || '');
        break;
      case 'sell_out_price_ttc':
        // Utiliser le prix total ou unitaire selon le mode d'affichage
        if (showTotals) {
          compareResult = a.total_sell_out - b.total_sell_out;
        } else {
          compareResult = a.sell_out_price_ttc - b.sell_out_price_ttc;
        }
        break;
      case 'sell_in_price_ht':
        // Utiliser le prix total ou unitaire selon le mode d'affichage
        if (showTotals) {
          compareResult = a.total_sell_in - b.total_sell_in;
        } else {
          compareResult = a.sell_in_price_ht - b.sell_in_price_ht;
        }
        break;
      case 'margin_percentage':
        compareResult = a.margin_percentage - b.margin_percentage;
        break;
      case 'stock_value_ht':
        compareResult = a.stock_value_ht - b.stock_value_ht;
        break;
      case 'sales_quantity':
        compareResult = a.sales_quantity - b.sales_quantity;
        break;
      case 'sales_evolution_percentage':
        compareResult = a.sales_evolution_percentage - b.sales_evolution_percentage;
        break;
      default:
        compareResult = 0;
    }
    
    return sortDirection === 'asc' ? compareResult : -compareResult;
  });
}, [filteredProducts, sortField, sortDirection, showTotals]); // Ajout de showTotals comme dépendance
  
  // Trouver le produit actuellement développé
  const expandedProduct = useMemo(() => {
    if (!expandedProductId) return null;
    return products.find(product => product.id === expandedProductId) || null;
  }, [expandedProductId, products]);
  
  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 animate-pulse">
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full mr-2"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="text-red-500 dark:text-red-400">
          Erreur: {error}
        </div>
      </div>
    );
  }
  
  // Aucun produit sélectionné
  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="text-center p-6">
          <FiPackage className="mx-auto text-gray-400 mb-3" size={24} />
          <p className="text-gray-500 dark:text-gray-400">
            Aucun produit sélectionné
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Utilisez le filtre pour sélectionner des produits
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <FiPackage className="text-gray-500 dark:text-gray-400 mr-2" size={20} />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Produits sélectionnés ({filteredProducts.length})
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button
              onClick={() => setShowTotals(!showTotals)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiRefreshCw className="mr-2 h-4 w-4" />
              {showTotals ? "Afficher prix unitaires" : "Afficher totaux"}
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('display_name')}
              >
                <div className="flex items-center">
                  Produit
                  {sortField === 'display_name' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
              <th scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('brand_lab')}
              >
                <div className="flex items-center">
                  Laboratoire
                  {sortField === 'brand_lab' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
              <th scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('sell_out_price_ttc')}
              >
                <div className="flex items-center">
                  {showTotals ? "CA TTC sell-out" : "Prix TTC"}
                  {sortField === 'sell_out_price_ttc' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
              <th scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('sell_in_price_ht')}
              >
                <div className="flex items-center">
                  {showTotals ? "CA HT sell-in" : "Prix HT"}
                  {sortField === 'sell_in_price_ht' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
              <th scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('margin_percentage')}
              >
                <div className="flex items-center">
                  Taux de Marge
                  {sortField === 'margin_percentage' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
              <th scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('stock_value_ht')}
              >
                <div className="flex items-center">
                  Stock EUROS HT
                  {sortField === 'stock_value_ht' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
              <th scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('sales_quantity')}
              >
                <div className="flex items-center">
                  Quantité Vendue
                  {sortField === 'sales_quantity' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Détail
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedProducts.map((product) => (
              <React.Fragment key={product.id}>
                <tr className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${expandedProductId === product.id ? 'bg-gray-50 dark:bg-gray-700' : ''}`}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{product.display_name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{product.code_13_ref}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{product.brand_lab || 'N/A'}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {showTotals ? formatCurrency(product.total_sell_out) : formatCurrency(product.sell_out_price_ttc)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {showTotals ? formatCurrency(product.total_sell_in) : formatCurrency(product.sell_in_price_ht)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{formatPercentage(product.margin_percentage)}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(product.margin_amount)}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(product.stock_value_ht)}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{product.stock_quantity} unités</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{product.sales_quantity}</div>
                    <div className="flex items-center text-xs">
                      {product.sales_evolution_percentage > 0 ? (
                        <>
                          <FiTrendingUp className="text-green-500 mr-1" size={12} />
                          <span className="text-green-500">+{Number(product.sales_evolution_percentage).toFixed(1)}%</span>
                        </>
                      ) : product.sales_evolution_percentage < 0 ? (
                        <>
                          <FiTrendingDown className="text-red-500 mr-1" size={12} />
                          <span className="text-red-500">{Number(product.sales_evolution_percentage).toFixed(1)}%</span>
                        </>
                      ) : (
                        <span className="text-gray-500">0%</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => toggleDetails(product.id)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiInfo className="mr-1" size={14} />
                      {expandedProductId === product.id ? 'Fermer' : 'Détail'}
                      <FiChevronDown className={`ml-1 transition-transform ${expandedProductId === product.id ? 'rotate-180' : ''}`} size={14} />
                    </button>
                  </td>
                </tr>
                
                {expandedProductId === product.id && (
                  <tr>
                    <td colSpan={8} className="px-0 py-0 bg-gray-50 dark:bg-gray-700">
                      <div className="p-4">
                        <div className="border-b border-gray-200 dark:border-gray-600">
                          <nav className="flex space-x-4">
                            <button
                              onClick={() => setActiveTab('info')}
                              className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                                activeTab === 'info' 
                                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' 
                                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                              }`}
                            >
                              Informations
                            </button>
                            <button
                              onClick={() => setActiveTab('sales')}
                              className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                                activeTab === 'sales' 
                                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' 
                                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                              }`}
                            >
                              Ventes
                            </button>
                            <button
                              onClick={() => setActiveTab('stock')}
                              className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                                activeTab === 'stock' 
                                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' 
                                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                              }`}
                            >
                              Stock
                            </button>
                            <button
                              onClick={() => setActiveTab('evolution')}
                              className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                                activeTab === 'evolution' 
                                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' 
                                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                              }`}
                            >
                              Évolution
                            </button>
                          </nav>
                        </div>
                        
                        <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                        {activeTab === 'info' && <ProductInfoTab code13ref={expandedProduct.code_13_ref} />}
                        {activeTab === 'sales' && <ProductSalesTab code13ref={expandedProduct?.code_13_ref} />}
                          {activeTab === 'stock' && <ProductStockTab code13ref={expandedProduct?.code_13_ref} />}
                          {activeTab === 'evolution' && <ProductEvolutionTab product={product} />}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}