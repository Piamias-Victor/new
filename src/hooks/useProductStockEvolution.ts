// src/hooks/useProductStockEvolution.ts
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useDataLoading } from '@/contexts/DataLoadingContext';

export interface StockDataItem {
  period: string;
  stock: number;
  value: number;
  rupture_quantity: number;
  is_rupture: boolean;
}

interface ProductStockEvolutionState {
  data: StockDataItem[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook personnalisé pour récupérer l'évolution du stock d'un produit spécifique
 */
export function useProductStockEvolution(
  code13ref: string,
  interval: 'day' | 'week' | 'month' = 'day'
): ProductStockEvolutionState {
  const [state, setState] = useState<ProductStockEvolutionState>({
    data: [],
    isLoading: false,
    error: null
  });
  
  // Contextes
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
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
      console.log('🔍 useProductStockEvolution: Prérequis manquants, pas de chargement');
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useProductStockEvolution: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchProductStockEvolution();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchProductStockEvolution = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useProductStockEvolution: Début du chargement de l\'évolution du stock produit');
    
    try {
      const abortSignal = createAbortSignal();
      
      // Construire la requête POST avec les paramètres
      const response = await fetch('/api/products/stock-evolution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code13ref,
          startDate,
          endDate,
          interval,
          pharmacyIds: selectedPharmacyIds
        }),
        cache: 'no-store',
        signal: abortSignal
      });
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useProductStockEvolution: Requête annulée');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des données de stock');
      }
      
      const result = await response.json();
      
      setState({
        data: result.data || [],
        isLoading: false,
        error: null
      });
      
      console.log('✅ useProductStockEvolution: Évolution du stock produit chargée avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useProductStockEvolution: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useProductStockEvolution: Erreur lors de la récupération des données:', error);
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