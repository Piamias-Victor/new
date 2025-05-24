// src/hooks/useOneProductSalesEvolution.ts
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useDataLoading } from '@/contexts/DataLoadingContext';

export interface SalesDataItem {
  period: string;
  revenue: number;
  margin: number;
  margin_percentage: number;
}

interface ProductSalesEvolutionState {
  data: SalesDataItem[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook personnalisé pour récupérer l'évolution des ventes d'un produit spécifique
 */
export function useOneProductSalesEvolution(
  code13ref: string,
  interval: 'day' | 'week' | 'month' = 'day'
): ProductSalesEvolutionState {
  const [state, setState] = useState<ProductSalesEvolutionState>({
    data: [],
    isLoading: false,
    error: null
  });
  
  // Contextes
  const { startDate, endDate } = useDateRange();
  const { isReadyToLoad, createAbortSignal, incrementActiveRequests, decrementActiveRequests } = useDataLoading();
  
  // Référence pour éviter les appels multiples
  const isLoadingRef = useRef(false);
  
  useEffect(() => {
    // Ne se déclenche QUE si isReadyToLoad est true
    if (!isReadyToLoad) {
      return;
    }
    
    // Vérifier les prérequis
    if (!startDate || !endDate || !code13ref) {
      console.log('🔍 useOneProductSalesEvolution: Prérequis manquants, pas de chargement');
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useOneProductSalesEvolution: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchProductSalesEvolution();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchProductSalesEvolution = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useOneProductSalesEvolution: Début du chargement de l\'évolution des ventes produit');
    
    try {
      const abortSignal = createAbortSignal();
      
      // Construire les paramètres pour la requête
      const params = new URLSearchParams({
        startDate,
        endDate,
        interval
      });
      
      // Ajouter le code du produit
      params.append('code13refs', code13ref);
      
      // Effectuer la requête
      const response = await fetch(`/api/sales/evolution?${params}`, {
        cache: 'no-store',
        signal: abortSignal
      });
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useOneProductSalesEvolution: Requête annulée');
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
      
      console.log('✅ useOneProductSalesEvolution: Évolution des ventes produit chargée avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useOneProductSalesEvolution: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useOneProductSalesEvolution: Erreur lors de la récupération des données:', error);
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