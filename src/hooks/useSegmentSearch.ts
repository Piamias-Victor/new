// src/hooks/useSegmentSearch.ts
import { useState, useCallback } from 'react';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { Segment } from '@/components/drawer/search/SegmentSearchResults';

interface SegmentSearchState {
  results: Segment[];
  isLoading: boolean;
  error: string | null;
}

export function useSegmentSearch() {
  const [state, setState] = useState<SegmentSearchState>({
    results: [],
    isLoading: false,
    error: null
  });
  
  const { selectedPharmacyIds } = usePharmacySelection();
  
  const searchSegments = useCallback(async (term: string) => {
    // Validation de base
    if (!term || term.trim().length < 2) {
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
      const queryParams = new URLSearchParams({
        name: term
      });
      
      // Ajouter les pharmacies sélectionnées
      if (selectedPharmacyIds.length > 0) {
        selectedPharmacyIds.forEach(id => {
          queryParams.append('pharmacyIds', id);
        });
      }
      
      // Effectuer la requête
      const response = await fetch(`/api/search/segments?${queryParams}`, {
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
      
      setState({
        results: data.segments || [],
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Erreur de recherche:', error);
      
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
    searchSegments,
    clearResults
  };
}