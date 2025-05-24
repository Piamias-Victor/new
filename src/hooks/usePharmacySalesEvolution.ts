// src/hooks/usePharmacySalesEvolution.ts (mise à jour)
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { useDataLoading } from '@/contexts/DataLoadingContext';

export interface SalesDataItem {
  period: string;
  revenue: number;
  margin: number;
  margin_percentage: number;
  quantity: number;
}

interface PharmacySalesEvolutionState {
  data: SalesDataItem[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook personnalisé pour récupérer l'évolution des ventes d'une pharmacie spécifique
 * Prend en compte la sélection de produits active
 */
export function usePharmacySalesEvolution(
  pharmacyId: string,
  interval: 'day' | 'week' | 'month' = 'day'
): PharmacySalesEvolutionState {
  const [state, setState] = useState<PharmacySalesEvolutionState>({
    data: [],
    isLoading: false,
    error: null
  });
  
  // Contextes
  const { startDate, endDate } = useDateRange();
  const { selectedCodes, isFilterActive } = useProductFilter();
  const { isReadyToLoad, createAbortSignal, incrementActiveRequests, decrementActiveRequests } = useDataLoading();
  
  // Référence pour éviter les appels multiples
  const isLoadingRef = useRef(false);
  
  useEffect(() => {
    // Ne se déclenche QUE si isReadyToLoad est true
    if (!isReadyToLoad) {
      return;
    }
    
    // Vérifier les prérequis
    if (!startDate || !endDate || !pharmacyId) {
      console.log('🔍 usePharmacySalesEvolution: Prérequis manquants, pas de chargement');
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 usePharmacySalesEvolution: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchPharmacySalesEvolution();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchPharmacySalesEvolution = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 usePharmacySalesEvolution: Début du chargement de l\'évolution des ventes pharmacie');
    
    try {
      const abortSignal = createAbortSignal();
      
      // Utiliser une requête POST si nous avons des codes EAN13 sélectionnés
      if (isFilterActive && selectedCodes.length > 0) {
        const response = await fetch(`/api/pharmacie/${pharmacyId}/sales/evolution`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate,
            endDate,
            interval,
            code13refs: selectedCodes
          }),
          cache: 'no-store',
          signal: abortSignal
        });
        
        // Vérifier si la requête a été annulée
        if (abortSignal.aborted) {
          console.log('🔍 usePharmacySalesEvolution: Requête POST annulée');
          return;
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des données');
        }
        
        const result = await response.json();
        
        setState({
          data: result.data || [],
          isLoading: false,
          error: null
        });
      } else {
        // Sinon, utiliser une requête GET
        const params = new URLSearchParams({
          startDate,
          endDate,
          interval
        });
        
        const response = await fetch(`/api/pharmacie/${pharmacyId}/sales/evolution?${params}`, {
          cache: 'no-store',
          signal: abortSignal
        });
        
        // Vérifier si la requête a été annulée
        if (abortSignal.aborted) {
          console.log('🔍 usePharmacySalesEvolution: Requête GET annulée');
          return;
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des données');
        }
        
        const result = await response.json();
        
        setState({
          data: result.data || [],
          isLoading: false,
          error: null
        });
      }
      
      console.log('✅ usePharmacySalesEvolution: Évolution des ventes pharmacie chargée avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 usePharmacySalesEvolution: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ usePharmacySalesEvolution: Erreur lors de la récupération des données:', error);
      setState({
        data: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      isLoadingRef.current = false;
      decrementActiveRequests();
    }
  };
  
  return state;
}