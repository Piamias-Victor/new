// src/contexts/ProductSearchContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SearchParams } from '@/services/productService';

// Interface pour les données de recherche
interface ProductSearchState {
  searchTerm: string;
  searchType: 'name' | 'code' | 'suffix' | 'list';
  isListMode: boolean;
}

// Interface pour le contexte
interface ProductSearchContextType {
  // État
  searchState: ProductSearchState;
  
  // Méthodes pour mettre à jour l'état
  setSearchTerm: (term: string) => void;
  setSearchType: (type: 'name' | 'code' | 'suffix' | 'list') => void;
  setIsListMode: (isListMode: boolean) => void;
  
  // Méthode pour obtenir les paramètres de recherche formatés
  getSearchParams: () => Omit<SearchParams, 'pharmacyIds'>;
  
  // Méthodes pour réinitialiser
  clearSearch: () => void;
}

// Valeurs par défaut
const defaultState: ProductSearchState = {
  searchTerm: '',
  searchType: 'name',
  isListMode: false
};

// Créer le contexte
const ProductSearchContext = createContext<ProductSearchContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export function useProductSearchContext() {
  const context = useContext(ProductSearchContext);
  if (context === undefined) {
    throw new Error('useProductSearchContext must be used within a ProductSearchProvider');
  }
  return context;
}

// Props pour le provider
interface ProductSearchProviderProps {
  children: ReactNode;
}

// Provider component
export function ProductSearchProvider({ children }: ProductSearchProviderProps) {
  // État local pour les données de recherche
  const [searchState, setSearchState] = useState<ProductSearchState>(defaultState);
  
  // Méthodes pour mettre à jour l'état
  const setSearchTerm = (term: string) => {
    setSearchState(prev => ({ ...prev, searchTerm: term }));
  };
  
  const setSearchType = (type: 'name' | 'code' | 'suffix' | 'list') => {
    setSearchState(prev => ({ ...prev, searchType: type }));
  };
  
  const setIsListMode = (isListMode: boolean) => {
    setSearchState(prev => ({ ...prev, isListMode }));
  };
  
  // Obtenir les paramètres de recherche formatés
  const getSearchParams = () => {
    return {
      term: searchState.searchTerm,
      type: searchState.searchType
    };
  };
  
  // Réinitialiser la recherche
  const clearSearch = () => {
    setSearchState(defaultState);
  };
  
  // Valeur du contexte
  const value = {
    searchState,
    setSearchTerm,
    setSearchType,
    setIsListMode,
    getSearchParams,
    clearSearch
  };
  
  // Rendu du provider
  return (
    <ProductSearchContext.Provider value={value}>
      {children}
    </ProductSearchContext.Provider>
  );
}