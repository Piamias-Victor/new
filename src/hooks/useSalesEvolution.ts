// src/hooks/useSalesEvolution.ts
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { useDataLoading } from '@/contexts/DataLoadingContext';

interface SalesEvolutionItem {
  period: string;
  revenue: number;
  margin: number;
  margin_percentage: number;
}

interface SalesEvolutionData {
  data: SalesEvolutionItem[];
  isLoading: boolean;
  error: string | null;
}

export function useSalesEvolutionWithFilter(interval: 'day' | 'week' | 'month' = 'day'): SalesEvolutionData {
  const [data, setData] = useState<SalesEvolutionData>({
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
      console.log('🔍 useSalesEvolutionWithFilter: Dates manquantes, pas de chargement');
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useSalesEvolutionWithFilter: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchSalesEvolution();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchSalesEvolution = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useSalesEvolutionWithFilter: Début du chargement de l\'évolution des ventes');
    
    try {
      const abortSignal = createAbortSignal();
      
      let response;
      
      // Détermine si on doit utiliser GET ou POST en fonction de la taille des données
      const shouldUsePost = isFilterActive && selectedCodes.length > 20;
      
      if (shouldUsePost) {
        // Utiliser POST pour les grandes listes de codes
        response = await fetch('/api/sales/evolution', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
        // Préparer les paramètres pour GET
        const params = new URLSearchParams({
          startDate,
          endDate,
          interval
        });
        
        // Si on a une sélection spécifique de pharmacies
        if (selectedPharmacyIds.length > 0) {
          selectedPharmacyIds.forEach(id => {
            params.append('pharmacyIds', id);
          });
        }
        
        // Si on a une sélection de codes EAN13
        if (isFilterActive && selectedCodes.length > 0) {
          selectedCodes.forEach(code => {
            params.append('code13refs', code);
          });
        }
        
        // Effectuer la requête GET
        response = await fetch(`/api/sales/evolution?${params}`, {
          cache: 'no-store',
          signal: abortSignal
        });
      }
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useSalesEvolutionWithFilter: Requête annulée');
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
      
      console.log('✅ useSalesEvolutionWithFilter: Évolution des ventes chargée avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useSalesEvolutionWithFilter: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useSalesEvolutionWithFilter: Erreur lors de la récupération des données:', error);
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