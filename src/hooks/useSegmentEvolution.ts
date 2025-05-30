// src/hooks/useSegmentEvolution.ts
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { useDataLoading } from '@/contexts/DataLoadingContext';
import { SegmentType } from './useSegmentDistribution';

export interface SegmentEvolutionItem {
  segment: string;
  current_revenue: number;
  previous_revenue: number;
  evolution_percentage: number;
}

export function useSegmentEvolution(segmentType: SegmentType = 'universe') {
  const [evolutionData, setEvolutionData] = useState<SegmentEvolutionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Contextes
  const { startDate, endDate, comparisonStartDate, comparisonEndDate, isComparisonEnabled } = useDateRange();
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
    if (!startDate || !endDate || !isComparisonEnabled || !comparisonStartDate || !comparisonEndDate) {
      console.log('🔍 useSegmentEvolution: Prérequis manquants, pas de chargement');
      setIsLoading(false);
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useSegmentEvolution: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchData();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchData = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setIsLoading(true);
    setError(null);
    
    console.log('🔍 useSegmentEvolution: Début du chargement de l\'évolution de segments');
    
    try {
      const abortSignal = createAbortSignal();
      
      const response = await fetch('/api/sales/segment-evolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          comparisonStartDate,
          comparisonEndDate,
          segmentType,
          pharmacyIds: selectedPharmacyIds,
          code13refs: isFilterActive ? selectedCodes : []
        }),
        signal: abortSignal
      });
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useSegmentEvolution: Requête annulée');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }
      
      const result = await response.json();
      setEvolutionData(result.data || []);
      
      console.log('✅ useSegmentEvolution: Évolution de segments chargée avec succès');
      
    } catch (err) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('🔍 useSegmentEvolution: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useSegmentEvolution: Erreur lors de la récupération des données:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setEvolutionData([]);
    } finally {
      isLoadingRef.current = false;
      decrementActiveRequests();
      setIsLoading(false);
    }
  };
  
  return { evolutionData, isLoading, error };
}