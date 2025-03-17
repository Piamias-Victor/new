// src/components/dashboard/products/ProductSearch.tsx
import React, { useEffect } from 'react';
import { FiSearch, FiCode, FiX } from 'react-icons/fi';
import { useProductSearchContext } from '@/contexts/ProductSearchContext';

interface ProductSearchProps {
  onSearch: () => Promise<void>;
  isLoading?: boolean;
}

export function ProductSearch({ onSearch, isLoading = false }: ProductSearchProps) {
  // Utiliser notre contexte pour partager l'état de recherche
  const { 
    searchState,
    setSearchTerm,
    setSearchType,
    setIsListMode,
    clearSearch
  } = useProductSearchContext();
  
  const { searchTerm, searchType, isListMode } = searchState;

  // Déterminer le type de recherche à partir de la valeur
  const detectSearchType = (value: string): 'name' | 'code' | 'suffix' | 'list' => {
    if (isListMode) {
      return 'list';
    } else if (value.startsWith('*')) {
      return 'suffix';
    } else if (/^\d+$/.test(value)) {
      return 'code';
    } else {
      return 'name';
    }
  };

  // Gérer le changement dans le champ de recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Mettre à jour le type de recherche en fonction de la valeur
    if (!isListMode) {
      setSearchType(detectSearchType(value));
    }
  };

  // Soumettre la recherche
  const handleSearchSubmit = async () => {
    if (searchTerm.trim()) {
      try {
        // Appeler la fonction onSearch fournie par le parent,
        // qui utilisera le hook useProductSearch pour effectuer la recherche
        await onSearch();
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
      }
    }
  };

  // Basculer entre le mode de recherche simple et le mode liste
  const toggleListMode = () => {
    const newListMode = !isListMode;
    setIsListMode(newListMode);
    setSearchType(newListMode ? 'list' : 'name');
    setSearchTerm(''); // Effacer le champ lors du changement de mode
  };

  // Effacer la recherche
  const handleClearSearch = () => {
    clearSearch();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recherche de produits
        </h3>
        <button
          onClick={toggleListMode}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          {isListMode ? (
            <>
              <FiSearch className="mr-1" size={16} />
              Mode recherche simple
            </>
          ) : (
            <>
              <FiCode className="mr-1" size={16} />
              Mode liste de codes
            </>
          )}
        </button>
      </div>
      
      <div className="space-y-4">
        {isListMode ? (
          // Mode liste de codes
          <textarea
            value={searchTerm}
            onChange={handleSearchChange}
            rows={5}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-sky-500 focus:border-sky-500"
            placeholder="Collez une liste de codes EAN (séparés par des sauts de ligne, virgules ou points-virgules)"
          />
        ) : (
          // Mode recherche simple
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {searchType === 'suffix' || searchType === 'code' ? (
                <FiCode className="h-5 w-5 text-gray-400" />
              ) : (
                <FiSearch className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-sky-500 focus:border-sky-500"
              placeholder={
                searchType === 'suffix' 
                  ? "Recherche par fin de code (*1234)" 
                  : searchType === 'code' 
                    ? "Recherche par code EAN13" 
                    : "Recherche par nom de produit"
              }
            />
            {searchTerm && (
              <button 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                onClick={handleClearSearch}
              >
                <FiX className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        
        <button
          onClick={handleSearchSubmit}
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Recherche en cours...
            </>
          ) : (
            <>
              <FiSearch className="mr-2" size={16} />
              Rechercher
            </>
          )}
        </button>
      </div>
    </div>
  );
}