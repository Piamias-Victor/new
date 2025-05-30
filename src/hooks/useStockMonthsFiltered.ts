// src/hooks/useStockMonthsFiltered.ts
import { useState, useEffect, useRef } from 'react';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { useDataLoading } from '@/contexts/DataLoadingContext';
import { StockProductData } from '@/hooks/useStockMonths';
import { useDateRange } from '@/contexts/DateRangeContext';

interface StockMonthsData {
  criticalLow: StockProductData[];
  toWatch: StockProductData[];
  optimal: StockProductData[];
  overStock: StockProductData[];
  criticalHigh: StockProductData[];
  isLoading: boolean;
  error: string | null;
}

export function useStockMonthsFiltered(): StockMonthsData {
  const [data, setData] = useState<StockMonthsData>({
    criticalLow: [],
    toWatch: [],
    optimal: [],
    overStock: [],
    criticalHigh: [],
    isLoading: false,
    error: null
  });
  
  // Contextes
  const { selectedPharmacyIds } = usePharmacySelection();
  const { selectedCodes, isFilterActive } = useProductFilter();
  const { startDate, endDate, comparisonStartDate, comparisonEndDate, isComparisonEnabled } = useDateRange();
  const { isReadyToLoad, createAbortSignal, incrementActiveRequests, decrementActiveRequests } = useDataLoading();
  
  // Référence pour éviter les appels multiples
  const isLoadingRef = useRef(false);
  
  useEffect(() => {
    // Ne se déclenche QUE si isReadyToLoad est true
    if (!isReadyToLoad) {
      return;
    }
    
    // Pas besoin de faire de requête si aucun produit n'est sélectionné
    if (isFilterActive && selectedCodes.length === 0) {
      console.log('🔍 useStockMonthsFiltered: Aucun produit sélectionné avec filtre actif');
      setData({
        criticalLow: [],
        toWatch: [],
        optimal: [],
        overStock: [],
        criticalHigh: [],
        isLoading: false,
        error: null
      });
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useStockMonthsFiltered: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchStockMonths();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchStockMonths = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useStockMonthsFiltered: Début du chargement des données stock en mois filtrées');
    
    try {
      const abortSignal = createAbortSignal();
      
      // Détermine si on doit utiliser POST ou GET en fonction du nombre de codes
      const shouldUsePost = isFilterActive && selectedCodes.length > 20;
      let response;
      
      if (shouldUsePost) {
        // Utiliser POST pour les grandes listes de codes
        response = await fetch('/api/inventory/stock-months', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pharmacyIds: selectedPharmacyIds.length > 0 ? selectedPharmacyIds : [],
            code13refs: isFilterActive ? selectedCodes : []
          }),
          cache: 'no-store',
          signal: abortSignal
        });
      } else {
        // Préparer les paramètres pour GET
        const params = new URLSearchParams();
        
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
        response = await fetch(`/api/inventory/stock-months?${params}`, {
          cache: 'no-store',
          signal: abortSignal
        });
      }
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useStockMonthsFiltered: Requête annulée');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des données');
      }
      
      const result = await response.json();
      
      setData({
        criticalLow: result.criticalLow || [],
        toWatch: result.toWatch || [],
        optimal: result.optimal || [],
        overStock: result.overStock || [],
        criticalHigh: result.criticalHigh || [],
        isLoading: false,
        error: null
      });
      
      console.log('✅ useStockMonthsFiltered: Données stock en mois filtrées chargées avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useStockMonthsFiltered: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useStockMonthsFiltered: Erreur lors de la récupération des données:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }));
    } finally {
      isLoadingRef.current = false;
      decrementActiveRequests();
    }
  };
  
  return data;
}