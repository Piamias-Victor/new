// src/components/dashboard/margins/MarginProductsModal.tsx
import React, { useState } from 'react';
import { FiX, FiSearch, FiTrendingUp, FiTrendingDown, FiDownload } from 'react-icons/fi';
import { MarginProductData } from '@/hooks/useProductMargins';

interface MarginProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: MarginProductData[];
  title: string;
}

export function MarginProductsModal({ 
  isOpen, 
  onClose, 
  products, 
  title 
}: MarginProductsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof MarginProductData>('margin_percentage');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
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
    if (['price_with_tax', 'weighted_average_price', 'margin_percentage', 'margin_amount', 'current_stock', 'total_sales'].includes(sortField as string)) {
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
  const handleSort = (field: keyof MarginProductData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Formatage des montants en euros
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Fonction pour exporter les données en CSV
  const exportToCSV = () => {
    setIsExporting(true);
    
    try {
      // Préparer les données pour l'export
      const exportData = sortedProducts.map(product => ({
        'Produit': product.display_name,
        'Laboratoire': product.brand_lab || '',
        'Code EAN': product.code_13_ref || '',
        'Prix TTC': product.price_with_tax,
        'Prix achat HT': product.weighted_average_price,
        'Marge (%)': product.margin_percentage,
        'Marge (€)': product.margin_amount,
        'Stock': product.current_stock
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
        
        {/* Contenu de la modale */}
        <div className="overflow-auto flex-grow p-1 relative">
          {/* En-tête de tableau avec position sticky et z-index élevé */}
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
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('price_with_tax')}>
                  <div className="flex items-center">
                    Prix TTC
                    {sortField === 'price_with_tax' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('weighted_average_price')}>
                  <div className="flex items-center">
                    Prix d'achat
                    {sortField === 'weighted_average_price' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('margin_percentage')}>
                  <div className="flex items-center">
                    Marge %
                    {sortField === 'margin_percentage' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('margin_amount')}>
                  <div className="flex items-center">
                    Marge €
                    {sortField === 'margin_amount' && (
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
              </tr>
            </thead>
            
            {/* Corps du tableau avec arrière-plan cohérent */}
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
                        {product.code_13_ref}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(product.price_with_tax)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(product.weighted_average_price)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        {product.margin_percentage < 0 ? (
                          <FiTrendingDown className="text-red-500 dark:text-red-400 mr-1" size={14} />
                        ) : product.margin_percentage > 0 ? (
                          <FiTrendingUp className="text-green-500 dark:text-green-400 mr-1" size={14} />
                        ) : null}
                        <span className={`font-medium ${
                          product.margin_percentage < 0 ? 'text-red-600 dark:text-red-400' :
                          product.margin_percentage < 10 ? 'text-amber-600 dark:text-amber-400' :
                          product.margin_percentage < 20 ? 'text-blue-600 dark:text-blue-400' :
                          product.margin_percentage <= 35 ? 'text-green-600 dark:text-green-400' :
                          'text-purple-600 dark:text-purple-400'
                        }`}>
                          {product.margin_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <span className={`font-medium ${
                        product.margin_amount < 0 ? 'text-red-600 dark:text-red-400' :
                        product.margin_amount > 0 ? 'text-green-600 dark:text-green-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`}>
                        {formatCurrency(product.margin_amount)}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {product.current_stock}
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