// src/components/drawer/search/ProductSearch.tsx
import React, { useState } from 'react';
import { useProductSearch } from '@/hooks/useProductSearch';
import { FiBox } from 'react-icons/fi';
import { ProductSearchResults } from './ProductSearchResults';
import { SearchInput } from './SearchInput';

/**
 * Composant de recherche par produit (nom ou code)
 */
export function ProductSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'code'>('name');
  const { results, isLoading, error, searchProducts } = useProductSearch();

  const handleSearch = () => {
    if (searchTerm.trim().length > 2) {
      searchProducts({ term: searchTerm, type: searchType });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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
              searchType === 'code' 
                ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            <FiBox size={16} />
            <span>Par code</span>
          </button>
        </div>

        {/* Champ de recherche */}
        <SearchInput
          placeholder={searchType === 'name' ? "Nom du produit..." : "Code EAN13..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onSearch={handleSearch}
        />

        {/* Message d'aide */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {searchType === 'name' 
            ? "Saisissez au moins 3 caractères pour rechercher un produit par son nom" 
            : "Saisissez un code EAN13 complet ou partiel pour rechercher un produit"}
        </p>
      </div>

      {/* Affichage des résultats */}
      <div className="flex-1 overflow-y-auto">
        <ProductSearchResults 
          results={results} 
          isLoading={isLoading} 
          error={error}
        />
      </div>
    </div>
  );
}