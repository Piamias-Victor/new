// Mise à jour de ProductSearch.tsx
import React, { useState, useEffect } from 'react';
import { FiBox, FiHash, FiInfo } from 'react-icons/fi';
import { ProductSearchResults, Product } from './ProductSearchResults';
import { SearchInput } from './SearchInput';
import { useProductSearch } from '@/hooks/useProductSearch';

interface ProductSearchProps {
  selectedProducts: Product[];
  onToggleProduct: (product: Product) => void;
}

/**
 * Composant de recherche par produit (nom ou code)
 */
export function ProductSearch({ selectedProducts, onToggleProduct }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'code' | 'suffix'>('name');
  const [showSuffixInfo, setShowSuffixInfo] = useState(false);
  const { results, isLoading, error, searchProducts, clearResults } = useProductSearch();

  // Détecter automatiquement si l'utilisateur utilise '*' pour chercher par fin de code
  useEffect(() => {
    if (searchTerm.startsWith('*')) {
      setSearchType('suffix');
    } else if (searchType === 'suffix' && !searchTerm.startsWith('*')) {
      setSearchType('code');
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

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 mb-4">
        {/* Choix du type de recherche */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex">
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
              searchType === 'code' || searchType === 'suffix'
                ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300'
            } relative`}
          >
            <FiHash size={16} />
            <span>Par code</span>
            <button 
              className="absolute right-0.5 top-0.5 text-gray-400 hover:text-sky-500 dark:hover:text-sky-400"
              onClick={(e) => {
                e.stopPropagation();
                setShowSuffixInfo(!showSuffixInfo);
              }}
            >
              <FiInfo size={14} />
            </button>
          </button>
        </div>
        
        {/* Info-bulle pour la recherche par fin de code */}
        {showSuffixInfo && (
          <div className="bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 p-2 rounded-md text-xs">
            <p>Vous pouvez rechercher par fin de code en commençant votre recherche par un astérisque (*). Par exemple, "*1234" recherchera tous les produits dont le code se termine par 1234.</p>
          </div>
        )}

        {/* Champ de recherche */}
        <SearchInput
          placeholder={searchType === 'name' 
            ? "Nom du produit..." 
            : searchType === 'suffix' 
              ? "*Fin du code EAN13..." 
              : "Code EAN13..."
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onSearch={handleSearch}
          onClear={handleClear}
        />

        {/* Message d'aide */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {searchType === 'name' 
            ? "Saisissez au moins 2 caractères pour rechercher par nom" 
            : searchType === 'suffix'
              ? "Recherche par fin de code EAN13 (ex: *1234)"
              : "Saisissez un code EAN13 complet ou partiel pour rechercher"}
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
        />
      </div>
    </div>
  );
}