// src/hooks/useProductSearch.ts (Version corrigée)
import { useState, useCallback } from 'react';

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
  type: 'name' | 'code' | 'list';
  pharmacyIds?: string[];
  limit?: number;
}

export function useProductSearch() {
  const [state, setState] = useState<SearchState>({
    results: [],
    isLoading: false,
    error: null
  });
  
  // 🔥 SUPPRESSION de la dépendance usePharmacySelection
  
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
      let searchResults: SearchProduct[] = [];
      
      // 🔥 UTILISER params.pharmacyIds au lieu de selectedPharmacyIds
      const pharmacyIds = params.pharmacyIds || [];
      
      if (params.type === 'name') {
        const queryParams = new URLSearchParams({
          name: params.term,
          limit: (params.limit || 200).toString()
        });
        
        // Ajouter les pharmacies sélectionnées
        if (pharmacyIds.length > 0) {
          pharmacyIds.forEach(id => {
            queryParams.append('pharmacyIds', id);
          });
        }
        
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
        searchResults = data.products || [];
      } else if (params.type === 'code') {
        // Vérifier si la recherche est un suffixe (commence par *)
        const isSuffixSearch = params.term.startsWith('*');
        const searchTerm = isSuffixSearch ? params.term.substring(1) : params.term;
        
        // Utiliser le paramètre approprié selon le type de recherche
        const queryParams = new URLSearchParams({
          limit: (params.limit || 200).toString()
        });
        
        if (isSuffixSearch) {
          queryParams.set('suffix', searchTerm);
        } else {
          queryParams.set('code', searchTerm);
        }
        
        // Ajouter les pharmacies sélectionnées
        if (pharmacyIds.length > 0) {
          pharmacyIds.forEach(id => {
            queryParams.append('pharmacyIds', id);
          });
        }
        
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
        searchResults = data.products || [];
      } else if (params.type === 'list') {
        // Diviser la liste et rechercher chaque code
        const codes = params.term
          .split(/[\n,;\s\t]+/) 
          .map(code => code.trim())
          .filter(Boolean);
        
        // Si aucun code valide, on lance pas la recherche
        if (codes.length === 0) {
          setState(prev => ({
            ...prev,
            results: [],
            isLoading: false,
            error: 'Aucun code valide n\'a été trouvé'
          }));
          return;
        }
        
        // Recherche pour chaque code
        const searchPromises = codes.map(async (code) => {
          // Déterminer si c'est une recherche par suffixe
          const isSuffixSearch = code.startsWith('*');
          const searchTerm = isSuffixSearch ? code.substring(1) : code;
          
          const queryParams = new URLSearchParams({
            limit: '1'
          });
          
          if (isSuffixSearch) {
            queryParams.set('suffix', searchTerm);
          } else {
            queryParams.set('code', searchTerm);
          }
          
          // Ajouter les pharmacies sélectionnées
          if (pharmacyIds.length > 0) {
            pharmacyIds.forEach(id => {
              queryParams.append('pharmacyIds', id);
            });
          }
          
          const response = await fetch(`/api/search/products?${queryParams}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store'
          });
          
          if (!response.ok) {
            console.error(`Erreur pour le code ${code}`);
            return [];
          }
          
          const data = await response.json();
          return data.products || [];
        });
        
        // Attendre toutes les recherches
        const resultSets = await Promise.all(searchPromises);
        
        // Aplatir et filtrer les résultats uniques
        searchResults = resultSets.flat().filter((product, index, self) => 
          index === self.findIndex((p) => p.code_13_ref === product.code_13_ref)
        );
      }
      
      // Mettre à jour l'état avec les résultats
      setState({
        results: searchResults,
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
  }, []); // 🔥 ARRAY VIDE - aucune dépendance
  
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