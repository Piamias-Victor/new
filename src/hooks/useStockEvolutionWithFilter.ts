// src/hooks/useStockEvolutionWithFilter.ts
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { useDataLoading } from '@/contexts/DataLoadingContext';

export interface StockEvolutionItem {
  period: string;
  stockQuantity: number;
  stockValue: number;
  ruptureQuantity: number;
  isRupture: boolean;
}

interface StockEvolutionData {
  data: StockEvolutionItem[];
  isLoading: boolean;
  error: string | null;
}

export function useStockEvolutionWithFilter(interval: 'day' | 'week' | 'month' = 'day'): StockEvolutionData {
  const [data, setData] = useState<StockEvolutionData>({
    data: [],
    isLoading: false,
    error: null
  });
  
  // Contextes
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
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
    if (!startDate || !endDate) {
      console.log('🔍 useStockEvolutionWithFilter: Dates manquantes, pas de chargement');
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useStockEvolutionWithFilter: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchStockEvolution();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchStockEvolution = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useStockEvolutionWithFilter: Début du chargement de l\'évolution du stock');
    
    try {
      const abortSignal = createAbortSignal();
      
      const shouldUsePost = isFilterActive && selectedCodes.length > 20;
      let response;
      
      if (shouldUsePost) {
        response = await fetch('/api/stock/evolution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate,
            endDate,
            interval,
            pharmacyIds: selectedPharmacyIds.length > 0 ? selectedPharmacyIds : [],
            code13refs: isFilterActive ? selectedCodes : []
          }),
          cache: 'no-store',
          signal: abortSignal
        });
      } else {
        const params = new URLSearchParams({
          startDate,
          endDate,
          interval
        });
        
        if (selectedPharmacyIds.length > 0) {
          selectedPharmacyIds.forEach(id => params.append('pharmacyIds', id));
        }
        
        if (isFilterActive && selectedCodes.length > 0) {
          selectedCodes.forEach(code => params.append('code13refs', code));
        }
        
        response = await fetch(`/api/stock/evolution?${params}`, { 
          cache: 'no-store',
          signal: abortSignal
        });
      }
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useStockEvolutionWithFilter: Requête annulée');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des données');
      }
      
      const result = await response.json();
      
      setData({
        data: result.data || [],
        isLoading: false,
        error: null
      });
      
      console.log('✅ useStockEvolutionWithFilter: Évolution du stock chargée avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useStockEvolutionWithFilter: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useStockEvolutionWithFilter: Erreur lors de la récupération des données:', error);
      setData({
        data: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      isLoadingRef.current = false;
      decrementActiveRequests();
    }
  };
  
  return data;
}