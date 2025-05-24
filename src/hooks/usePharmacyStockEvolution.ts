// src/hooks/usePharmacyStockEvolution.ts
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { useDataLoading } from '@/contexts/DataLoadingContext';

export interface StockDataItem {
  period: string;
  stockQuantity: number;
  stockValue: number;
  productsCount: number;
  ruptureQuantity: number;  // Quantité de produits en rupture
  isRupture: boolean;       // Indicateur de rupture pour cette période
}

interface PharmacyStockEvolutionState {
  data: StockDataItem[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook personnalisé pour récupérer l'évolution du stock d'une pharmacie spécifique
 * Prend en compte la sélection de produits active et les ruptures de stock
 */
export function usePharmacyStockEvolution(
  pharmacyId: string,
  interval: 'day' | 'week' | 'month' = 'day'
): PharmacyStockEvolutionState {
  const [state, setState] = useState<PharmacyStockEvolutionState>({
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
      console.log('🔍 usePharmacyStockEvolution: Prérequis manquants, pas de chargement');
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 usePharmacyStockEvolution: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchPharmacyStockEvolution();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchPharmacyStockEvolution = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 usePharmacyStockEvolution: Début du chargement de l\'évolution du stock pharmacie');
    
    try {
      const abortSignal = createAbortSignal();
      
      // Utiliser une requête POST si nous avons des codes EAN13 sélectionnés
      if (isFilterActive && selectedCodes.length > 0) {
        const response = await fetch(`/api/pharmacie/${pharmacyId}/stock/evolution`, {
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
          console.log('🔍 usePharmacyStockEvolution: Requête POST annulée');
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
        
        const response = await fetch(`/api/pharmacie/${pharmacyId}/stock/evolution?${params}`, {
          cache: 'no-store',
          signal: abortSignal
        });
        
        // Vérifier si la requête a été annulée
        if (abortSignal.aborted) {
          console.log('🔍 usePharmacyStockEvolution: Requête GET annulée');
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
      
      console.log('✅ usePharmacyStockEvolution: Évolution du stock pharmacie chargée avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 usePharmacyStockEvolution: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ usePharmacyStockEvolution: Erreur lors de la récupération des données:', error);
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