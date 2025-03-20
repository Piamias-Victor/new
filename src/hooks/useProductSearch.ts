// src/hooks/useProductSearch.ts
import { useState, useCallback } from 'react';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import apiClient from '@/utils/apiUtils';

export interface SearchProduct {
  id: string;
  name: string;
  display_name: string;
  code_13_ref: string;
  category?: string;
  brand_lab?: string;
  price_with_tax?: number;
  current_stock?: number;
  tva_rate?: number;
}

interface SearchState {
  results: SearchProduct[];
  isLoading: boolean;
  error: string | null;
}

interface SearchParams {
  term: string;
  searchType: 'name' | 'code' | 'lab' | 'category';
}

/**
 * Hook pour la recherche de produits
 * Permet de chercher des produits selon différents critères
 */
export function useProductSearch() {
  const [state, setState] = useState<SearchState>({
    results: [],
    isLoading: false,
    error: null
  });
  
  const { selectedPharmacyIds } = usePharmacySelection();
  
  const searchProducts = useCallback(async (params: SearchParams) => {
    // Validation de base
    if (!params.term || params.term.trim().length < 2) {
      setState(prev => ({
        ...prev,
        error: 'Veuillez saisir au moins 2 caractères',
        results: []
      }));
      return;
    }
    
    // Démarrer le chargement
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Construire les paramètres de la requête
      const queryParams = new URLSearchParams();
      
      // Ajouter le terme de recherche selon le type
      switch (params.searchType) {
        case 'name':
          queryParams.append('name', params.term);
          break;
        case 'code':
          queryParams.append('code', params.term);
          break;
        case 'lab':
          queryParams.append('lab', params.term);
          break;
        case 'category':
          queryParams.append('category', params.term);
          break;
      }
      
      // Ajouter les pharmacies sélectionnées
      if (selectedPharmacyIds.length > 0) {
        selectedPharmacyIds.forEach(id => {
          queryParams.append('pharmacyIds', id);
        });
      }
      
      // Effectuer la requête
      const response = await apiClient.get(`/api/search/products?${queryParams}`);
      
      // Mettre à jour l'état avec les résultats
      setState({
        results: response.data.products || [],
        isLoading: false,
        error: null
      });
    } catch (error) {
      // Gérer les erreurs
      setState({
        results: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la recherche'
      });
    }
  }, [selectedPharmacyIds]);
  
  // Fonction pour réinitialiser les résultats
  const clearResults = useCallback(() => {
    setState({
      results: [],
      isLoading: false,
      error: null
    });
  }, []);
  
  return {
    ...state,
    searchProducts,
    clearResults
  };
}