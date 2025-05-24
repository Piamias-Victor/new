// src/hooks/useLabSearch.ts (Version avec debug)
import { useState, useCallback } from 'react';
import { Laboratory } from '@/components/drawer/search/LabSearchResults';

interface LabSearchState {
  results: Laboratory[];
  isLoading: boolean;
  error: string | null;
}

export function useLabSearch() {
  console.log('🔍 useLabSearch: Hook initialisé');
  
  const [state, setState] = useState<LabSearchState>({
    results: [],
    isLoading: false,
    error: null
  });
  
  const searchLabs = useCallback(async (term: string, pharmacyIds: string[] = []) => {
    console.log('🔍 useLabSearch: searchLabs appelé', { term, pharmacyIds });
    
    // Validation de base
    if (!term || term.trim().length < 2) {
      console.log('🔍 useLabSearch: Terme trop court', term);
      setState(prev => ({
        ...prev,
        error: 'Veuillez saisir au moins 2 caractères',
        results: []
      }));
      return;
    }
    
    // Démarrer le chargement
    console.log('🔍 useLabSearch: Début du chargement...');
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Construire les paramètres de la requête
      const queryParams = new URLSearchParams({
        name: term
      });
      
      // Utiliser les pharmacyIds passés en paramètre
      if (pharmacyIds.length > 0) {
        console.log('🔍 useLabSearch: Ajout des pharmacyIds', pharmacyIds);
        pharmacyIds.forEach(id => {
          queryParams.append('pharmacyIds', id);
        });
      } else {
        console.log('🔍 useLabSearch: Aucune pharmacy sélectionnée');
      }
      
      const url = `/api/search/labs?${queryParams}`;
      console.log('🔍 useLabSearch: URL de requête', url);
      
      // Effectuer la requête
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });
      
      console.log('🔍 useLabSearch: Réponse reçue', { 
        status: response.status, 
        ok: response.ok 
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔍 useLabSearch: Données reçues', { 
        labsCount: data.labs?.length || 0,
        firstLab: data.labs?.[0]?.name || 'Aucun'
      });
      
      // Mettre à jour l'état avec les résultats
      setState({
        results: data.labs || [],
        isLoading: false,
        error: null
      });
      
      console.log('🔍 useLabSearch: État mis à jour avec succès');
      
    } catch (error) {
      console.error('❌ useLabSearch: Erreur de recherche:', error);
      
      // Gérer les erreurs
      setState({
        results: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la recherche'
      });
    }
  }, []); // Array vide - aucune dépendance
  
  // Fonction pour réinitialiser les résultats
  const clearResults = useCallback(() => {
    console.log('🔍 useLabSearch: clearResults appelé');
    setState({
      results: [],
      isLoading: false,
      error: null
    });
  }, []);
  
  console.log('🔍 useLabSearch: État actuel', { 
    resultsCount: state.results.length, 
    isLoading: state.isLoading, 
    error: state.error 
  });
  
  return {
    ...state,
    searchLabs,
    clearResults
  };
}