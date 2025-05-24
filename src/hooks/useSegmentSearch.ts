// src/hooks/useSegmentSearch.ts (Version corrigée)
import { useState, useCallback } from 'react';
import { UnifiedSegment } from '@/components/drawer/search/SegmentSearch';

interface SegmentSearchState {
  results: UnifiedSegment[];
  isLoading: boolean;
  error: string | null;
}

export function useSegmentSearch() {
  const [state, setState] = useState<SegmentSearchState>({
    results: [],
    isLoading: false,
    error: null
  });
  
  // 🔥 SUPPRESSION de la dépendance usePharmacySelection
  
  // Nouvelle fonction de recherche unifiée
  const searchUnifiedSegments = useCallback(async (term: string, pharmacyIds: string[] = []) => {
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
        term: term.trim(),
        // Mode unified pour indiquer à l'API de chercher dans tous les types
        mode: 'unified'  
      });
      
      // 🔥 UTILISER les pharmacyIds passés en paramètre
      if (pharmacyIds.length > 0) {
        pharmacyIds.forEach(id => {
          queryParams.append('pharmacyIds', id);
        });
      }
      
      // Effectuer la requête
      const response = await fetch(`/api/search/segments-unified?${queryParams}`, {
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
    searchUnifiedSegments,
    clearResults
  };
}