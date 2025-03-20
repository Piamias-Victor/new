import { useState, useCallback } from 'react';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { Laboratory } from '@/components/drawer/search/LabSearchResults';

interface LabSearchState {
  results: Laboratory[];
  isLoading: boolean;
  error: string | null;
}

export function useLabSearch() {
  const [state, setState] = useState<LabSearchState>({
    results: [],
    isLoading: false,
    error: null
  });
  
  const { selectedPharmacyIds } = usePharmacySelection();
  
  const searchLabs = useCallback(async (term: string) => {
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
      const response = await fetch(`/api/search/labs?${queryParams}`, {
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
        results: data.labs || [],
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
    searchLabs,
    clearResults
  };
}