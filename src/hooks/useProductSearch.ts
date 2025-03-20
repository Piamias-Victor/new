// Mise à jour de useProductSearch.ts
import { useState, useCallback } from 'react';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

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

// Mise à jour de l'interface pour inclure le type 'suffix'
interface SearchParams {
  term: string;
  type: 'name' | 'code' | 'suffix' | 'lab' | 'category';
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
      switch (params.type) {
        case 'name':
          queryParams.append('name', params.term);
          break;
        case 'code':
          queryParams.append('code', params.term);
          break;
        case 'suffix':
          // Enlever l'astérisque et envoyer juste le suffixe
          queryParams.append('suffix', params.term.replace(/^\*+/, ''));
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
      
      // Effectuer la requête avec fetch au lieu d'apiClient
      const response = await fetch(`/api/search/products?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Mettre à jour l'état avec les résultats
      setState({
        results: data.products || [],
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Erreur de recherche:', error);
      
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