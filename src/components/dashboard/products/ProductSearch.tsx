// src/components/dashboard/products/ProductSearch.tsx
import React, { useEffect, useState } from 'react';
import { FiSearch, FiX, FiBarChart2, FiList, FiFileText, FiHash, FiTag } from 'react-icons/fi';
import { useProductSearchContext } from '@/contexts/ProductSearchContext';

interface ProductSearchProps {
  onSearch: () => Promise<void>;
  isLoading?: boolean;
}

export function ProductSearch({ onSearch, isLoading = false }: ProductSearchProps) {
  const { 
    searchState,
    setSearchTerm,
    setSearchType,
    setIsListMode,
    clearSearch
  } = useProductSearchContext();
  
  const { searchTerm, searchType, isListMode } = searchState;
  const [searchPlaceholder, setSearchPlaceholder] = useState('');

  // Détecter automatiquement le type de recherche
  useEffect(() => {
    if (!isListMode) {
      let newType: 'name' | 'code' | 'suffix' = 'name';
      
      if (searchTerm.startsWith('*')) {
        newType = 'suffix';
      } else if (/^\d+$/.test(searchTerm)) {
        newType = 'code';
      }
      
      // Seulement mettre à jour si le type a changé
      if (newType !== searchType) {
        setSearchType(newType);
      }
    }
  }, [searchTerm, isListMode, searchType, setSearchType]);

  // Mettre à jour le placeholder en fonction du type de recherche
  useEffect(() => {
    if (isListMode) {
      setSearchPlaceholder("Collez une liste de codes EAN (un par ligne, ou séparés par des virgules/points-virgules)");
    } else {
      switch (searchType) {
        case 'code':
          setSearchPlaceholder("Recherche par code EAN13 exact (ex: 3400935645791)");
          break;
        case 'suffix':
          setSearchPlaceholder("Recherche par fin de code (*1234)");
          break;
        default:
          setSearchPlaceholder("Recherchez un produit par nom, laboratoire ou catégorie");
      }
    }
  }, [searchType, isListMode]);

  // Gérer le changement dans le champ de recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSearchTerm(e.target.value);
  };

  // Soumettre avec touche Entrée pour une meilleure UX
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && searchTerm.trim()) {
      e.preventDefault();
      onSearch();
    }
  };

  // Toggle mode liste
  const toggleListMode = () => {
    setIsListMode(!isListMode);
    setSearchTerm('');
    setSearchType(isListMode ? 'name' : 'list');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      {/* En-tête avec titre et options */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
            <FiSearch size={20} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recherche de produits
          </h3>
        </div>
        
        <button
          onClick={toggleListMode}
          className="inline-flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {isListMode ? (
            <>
              <FiSearch className="mr-2" size={16} />
              Mode standard
            </>
          ) : (
            <>
              <FiFileText className="mr-2" size={16} />
              Mode liste
            </>
          )}
        </button>
      </div>
      
      {/* Corps avec le champ de recherche */}
      <div className="p-6">
        {isListMode ? (
          // Mode liste de codes
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              <FiList className="mr-2" size={14} />
              <span>Entrez vos codes EAN sur des lignes séparées ou avec des virgules/points-virgules</span>
            </div>
            <div className="relative">
              <textarea
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder={searchPlaceholder}
              />
              {searchTerm && (
                <button 
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  onClick={clearSearch}
                >
                  <FiX className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span className="font-medium">Astuce :</span> Copiez-collez directement depuis Excel ou un fichier texte
            </div>
          </div>
        ) : (
          // Mode recherche simple avec types de recherche en onglets
          <div className="space-y-4">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex">
              <button
                onClick={() => setSearchType('name')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  searchType === 'name' 
                    ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white'
                }`}
                aria-pressed={searchType === 'name'}
              >
                <div className="flex items-center justify-center">
                  <FiBarChart2 className="mr-1.5" size={14} />
                  Nom / Labo
                </div>
              </button>
              <button
                onClick={() => setSearchType('code')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  searchType === 'code' 
                    ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white'
                }`}
                aria-pressed={searchType === 'code'}
              >
                <div className="flex items-center justify-center">
                  <FiHash className="mr-1.5" size={14} />
                  Code EAN
                </div>
              </button>
              <button
                onClick={() => setSearchType('suffix')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  searchType === 'suffix' 
                    ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white'
                }`}
                aria-pressed={searchType === 'suffix'}
              >
                <div className="flex items-center justify-center">
                  <FiTag className="mr-1.5" size={14} />
                  Fin de code
                </div>
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {searchType === 'suffix' ? (
                  <FiTag className="h-5 w-5 text-gray-400" />
                ) : searchType === 'code' ? (
                  <FiHash className="h-5 w-5 text-gray-400" />
                ) : (
                  <FiSearch className="h-5 w-5 text-gray-400" />
                )}
              </div>
              
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                className="block w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder={searchPlaceholder}
              />
              
              {searchTerm && (
                <button 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                  onClick={clearSearch}
                >
                  <FiX className="h-5 w-5" />
                </button>
              )}
            </div>
            
            {/* Informations contextuelles selon le type de recherche */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {searchType === 'name' ? (
                <span>Recherchez un produit par son nom, laboratoire ou catégorie.</span>
              ) : searchType === 'code' ? (
                <span>Entrez un code EAN13 exact pour retrouver un produit spécifique.</span>
              ) : (
                <span>Utilisez '*' suivi des derniers chiffres pour retrouver des produits par la fin de leur code.</span>
              )}
            </div>
          </div>
        )}
        
        {/* Bouton de recherche */}
        <div className="mt-6">
          <button
            onClick={() => onSearch()}
            disabled={isLoading || !searchTerm.trim()}
            className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Recherche en cours...
              </>
            ) : (
              <>
                <FiSearch className="mr-2" size={18} />
                {isListMode ? 'Rechercher ces codes' : 'Rechercher'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}