import React, { useState, useEffect } from 'react';
import { FiBox, FiHash, FiList, FiInfo } from 'react-icons/fi';
import { ProductSearchResults, Product } from './ProductSearchResults';
import { SearchInput } from './SearchInput';
import { useProductSearch } from '@/hooks/useProductSearch';

interface ProductSearchProps {
  selectedProducts: Product[];
  onToggleProduct: (product: Product) => void;
}

/**
 * Composant de recherche par produit (nom, code ou liste)
 */
export function ProductSearch({ selectedProducts, onToggleProduct }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'code' | 'list'>('name');
  const [showTooltip, setShowTooltip] = useState(false);
  const { results, isLoading, error, searchProducts, clearResults } = useProductSearch();

  // Détecter automatiquement si l'utilisateur utilise '*' pour chercher par fin de code
  // Ou si la recherche contient plusieurs codes
  useEffect(() => {
    if (searchTerm.startsWith('*')) {
      setSearchType('code');
    } else if (/[\n,;\s]/.test(searchTerm)) {
      // Si contient des séparateurs, passer en mode liste
      setSearchType('list');
    }
  }, [searchTerm]);

  // Gérer la recherche
  const handleSearch = () => {
    if (searchTerm.trim().length >= 2) {
      searchProducts({
        term: searchTerm,
        type: searchType
      });
    }
  };

  // Soumettre avec touche Entrée
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim().length >= 2) {
      handleSearch();
    }
  };

  // Effacer la recherche
  const handleClear = () => {
    setSearchTerm('');
    clearResults();
  };

  // Sélectionner tous les produits du résultat de recherche
  const handleSelectAllResults = () => {
    // Si tous les produits sont déjà sélectionnés, on les désélectionne
    const areAllSelected = results.every(product => 
      selectedProducts.some(p => p.id === product.id)
    );

    if (areAllSelected) {
      // Désélectionner tous
      results.forEach(product => {
        if (selectedProducts.some(p => p.id === product.id)) {
          onToggleProduct(product);
        }
      });
    } else {
      // Sélectionner tous les produits qui ne sont pas déjà sélectionnés
      results.forEach(product => {
        if (!selectedProducts.some(p => p.id === product.id)) {
          onToggleProduct(product);
        }
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 mb-4">
        {/* Choix du type de recherche */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex flex-1">
              <button
                onClick={() => setSearchType('name')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 ${
                  searchType === 'name' 
                    ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <FiBox size={16} />
                <span>Par nom</span>
              </button>
              <button
                onClick={() => setSearchType('code')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 ${
                  searchType === 'code' || searchType === 'list'
                    ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <FiHash size={16} />
                <span>Par code</span>
              </button>
              <button
                onClick={() => setSearchType('list')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 ${
                  searchType === 'list'
                    ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <FiList size={16} />
                <span>Liste</span>
              </button>
            </div>
            <div className="relative">
              <button 
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <FiInfo size={16} />
              </button>
              
              {showTooltip && (
                <div className="absolute right-0 z-10 w-64 p-3 text-xs bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  <p>Types de recherche :</p>
                  <ul className="list-disc pl-4 mt-1">
                    <li>Nom : recherche par nom de produit</li>
                    <li>Code : recherche par code EAN13</li>
                    <li>Liste : collez plusieurs codes</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Champ de recherche */}
        <SearchInput
          placeholder={
            searchType === 'name' 
              ? "Nom du produit..." 
              : searchType === 'list'
                ? "Liste de codes EAN13..." 
                : "Code EAN13..."
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onSearch={handleSearch}
          onClear={handleClear}
          multiline={searchType === 'list'}
        />

        {/* Message d'aide */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {searchType === 'name' 
            ? "Saisissez au moins 2 caractères pour rechercher par nom" 
            : searchType === 'list'
              ? "Collez une liste de codes EAN13 séparés par virgules, espaces ou sauts de ligne" 
              : "Saisissez un code EAN13 complet"}
        </p>
      </div>

      {/* Affichage des résultats */}
      <div className="flex-1 overflow-y-auto">
        <ProductSearchResults 
          results={results} 
          isLoading={isLoading} 
          error={error}
          selectedProducts={selectedProducts}
          onToggleProduct={onToggleProduct}
          onSelectAllResults={handleSelectAllResults}
        />
      </div>
    </div>
  );
}