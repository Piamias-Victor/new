// src/components/dashboard/prices/PriceComparisonModal.tsx
import React, { useState } from 'react';
import { FiX, FiSearch, FiArrowUp, FiArrowDown, FiDownload } from 'react-icons/fi';
import { PriceComparisonProductData } from '@/hooks/usePriceComparison';

interface PriceComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: PriceComparisonProductData[];
  title: string;
}

export function PriceComparisonModal({ 
  isOpen, 
  onClose, 
  products, 
  title 
}: PriceComparisonModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof PriceComparisonProductData>('price_difference_percentage');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isExporting, setIsExporting] = useState(false);
  
  if (!isOpen) return null;
  
  const filteredProducts = products.filter(product => 
    product.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand_lab?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code_13_ref?.includes(searchTerm)
  );
  
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (['price', 'avg_price', 'min_price', 'max_price', 'price_difference_percentage'].includes(sortField as string)) {
      aValue = Number(aValue || 0);
      bValue = Number(bValue || 0);
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' 
      ? Number(aValue) - Number(bValue) 
      : Number(bValue) - Number(aValue);
  });
  
  const handleSort = (field: keyof PriceComparisonProductData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  const formatPercentage = (value: number | string) => {
    // Convertir en nombre si c'est une chaîne
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Vérifier si c'est un nombre valide
    if (isNaN(numValue)) return '0.0%';
    
    // Formater avec une précision de 1 décimale
    return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(1)}%`;
  };

  // Fonction pour exporter les données en CSV
  const exportToCSV = () => {
    setIsExporting(true);
    
    try {
      // Préparer les données pour l'export
      const exportData = sortedProducts.map(product => ({
        'Produit': product.display_name,
        'Laboratoire': product.brand_lab || '',
        'Catégorie': product.category || '',
        'Code EAN': product.code_13_ref || '',
        'Prix vente TTC': product.price,
        'Prix moyen TTC': product.avg_price,
        'Prix min TTC': product.min_price,
        'Prix max TTC': product.max_price,
        'Écart (%)': typeof product.price_difference_percentage === 'string' 
          ? parseFloat(product.price_difference_percentage)
          : product.price_difference_percentage
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
      const filename = title.replace(/[^\w\s]/gi, '_').replace(/\s+/g, '_');
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${date}.csv`);
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
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
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
              onClick={exportToCSV}
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
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('price')}>
                  <div className="flex items-center">
                    Prix vente
                    {sortField === 'price' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('avg_price')}>
                  <div className="flex items-center">
                    Prix moyen
                    {sortField === 'avg_price' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('min_price')}>
                  <div className="flex items-center">
                    Prix min
                    {sortField === 'min_price' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('max_price')}>
                  <div className="flex items-center">
                    Prix max
                    {sortField === 'max_price' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('price_difference_percentage')}>
                  <div className="flex items-center">
                    Écart
                    {sortField === 'price_difference_percentage' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Aucun produit trouvé
                  </td>
                </tr>
              ) : (
                sortedProducts.map((product) => (
                  <tr key={product.code_13_ref || product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <div className="font-medium text-gray-900 dark:text-white">{product.display_name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {product.brand_lab && `${product.brand_lab} • `}
                        {product.category && `${product.category} • `}
                        {product.code_13_ref}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(product.avg_price)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(product.min_price)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(product.max_price)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        {parseFloat(String(product.price_difference_percentage)) < 0 ? (
                          <FiArrowDown className="text-red-500 dark:text-red-400 mr-1" size={14} />
                        ) : parseFloat(String(product.price_difference_percentage)) > 0 ? (
                          <FiArrowUp className="text-green-500 dark:text-green-400 mr-1" size={14} />
                        ) : null}
                        <span className={`font-medium ${
                          parseFloat(String(product.price_difference_percentage)) < -15 ? 'text-red-600 dark:text-red-400' :
                          parseFloat(String(product.price_difference_percentage)) < -5 ? 'text-amber-600 dark:text-amber-400' :
                          parseFloat(String(product.price_difference_percentage)) <= 5 ? 'text-blue-600 dark:text-blue-400' :
                          parseFloat(String(product.price_difference_percentage)) <= 15 ? 'text-green-600 dark:text-green-400' :
                          'text-purple-600 dark:text-purple-400'
                        }`}>
                          {formatPercentage(product.price_difference_percentage)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
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