// src/components/dashboard/inventory/StockProductsModal.tsx
import React, { useState } from 'react';
import { FiX, FiSearch, FiDownload } from 'react-icons/fi';
import { StockProductData } from '@/hooks/useStockMonths';

interface StockProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: StockProductData[];
  title: string;
}

export function StockProductsModal({ 
  isOpen, 
  onClose, 
  products, 
  title 
}: StockProductsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof StockProductData>('stock_months');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isExporting, setIsExporting] = useState(false);
  
  if (!isOpen) return null;
  
  // Fonction pour filtrer les produits par recherche
  const filteredProducts = products.filter(product => 
    product.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand_lab?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code_13_ref?.includes(searchTerm)
  );
  
  // Fonction pour trier les produits - CORRIGÉE pour gérer correctement les valeurs numériques
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Conversion explicite en nombre pour les champs numériques
    if (['current_stock', 'avg_monthly_sales', 'stock_months'].includes(sortField as string)) {
      aValue = Number(aValue || 0);
      bValue = Number(bValue || 0);
    }
    
    // Tri pour les chaines de caractères
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    // Tri pour les nombres
    return sortDirection === 'asc' 
      ? Number(aValue) - Number(bValue) 
      : Number(bValue) - Number(aValue);
  });
  
  // Fonction pour changer le tri
  const handleSort = (field: keyof StockProductData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Fonction pour formater le nombre de mois en texte
  const formatMonths = (months: number) => {
    return `${Number(months).toFixed(1)} mois`;
  };

  // Fonction pour exporter les données en Excel
  const exportToExcel = () => {
    setIsExporting(true);
    
    try {
      // Préparer les données pour l'export
      const exportData = sortedProducts.map(product => ({
        'Produit': product.display_name,
        'Laboratoire': product.brand_lab || '',
        'Code EAN': product.code_13_ref || '',
        'Stock actuel': product.current_stock,
        'Ventes mensuelles': product.avg_monthly_sales,
        'Mois de stock': product.stock_months >= 99 ? 'Infini' : Number(product.stock_months).toFixed(1)
      }));
      
      // Convertir en CSV
      const headers = Object.keys(exportData[0]).join(';');
      const csvData = exportData.map(row => Object.values(row).join(';')).join('\n');
      const csvContent = `${headers}\n${csvData}`;
      
      // Créer un blob et un lien de téléchargement
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Configurer et déclencher le téléchargement
      link.setAttribute('href', url);
      link.setAttribute('download', `${title.replace(/[^\w\s]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* En-tête de la modale */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Barre de recherche et bouton d'export */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between">
            <div className="relative flex-1 mr-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:text-white text-sm"
                placeholder="Rechercher par nom, laboratoire, catégorie ou code"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={exportToExcel}
              disabled={isExporting || sortedProducts.length === 0}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                isExporting || sortedProducts.length === 0
                  ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
            >
              <FiDownload className="mr-2" />
              {isExporting ? 'Exportation...' : 'Exporter CSV'}
            </button>
          </div>
        </div>
        
        {/* Contenu de la modale */}
        <div className="overflow-auto flex-grow p-1 relative">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('display_name')}>
                  <div className="flex items-center">
                    Produit
                    {sortField === 'display_name' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('current_stock')}>
                  <div className="flex items-center">
                    Stock
                    {sortField === 'current_stock' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('avg_monthly_sales')}>
                  <div className="flex items-center">
                    Vente/mois
                    <span className="ml-1 text-xs font-normal text-gray-400 dark:text-gray-500 normal-case">(extrapolé)</span>
                    {sortField === 'avg_monthly_sales' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('stock_months')}>
                  <div className="flex items-center">
                    Mois de stock
                    {sortField === 'stock_months' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Aucun produit trouvé
                  </td>
                </tr>
              ) : (
                sortedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <div className="font-medium text-gray-900 dark:text-white">{product.display_name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {product.brand_lab && `${product.brand_lab} • `}
                        {product.code_13_ref}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {product.current_stock}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {product.avg_monthly_sales}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {product.stock_months >= 99 ? (
                        <span className="text-purple-600 dark:text-purple-400 font-medium">∞</span>
                      ) : (
                        <span className={`font-medium ${
                          product.stock_months < 1 ? 'text-red-600 dark:text-red-400' :
                          product.stock_months < 3 ? 'text-amber-600 dark:text-amber-400' :
                          product.stock_months <= 6 ? 'text-green-600 dark:text-green-400' :
                          product.stock_months <= 12 ? 'text-blue-600 dark:text-blue-400' :
                          'text-purple-600 dark:text-purple-400'
                        }`}>
                          {formatMonths(product.stock_months)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pied de la modale */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-right">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {sortedProducts.length} produit{sortedProducts.length !== 1 ? 's' : ''}
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              onClick={onClose}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}