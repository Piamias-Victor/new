// src/hooks/usePriceComparison.ts
import { useState, useEffect, useRef } from 'react';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useDataLoading } from '@/contexts/DataLoadingContext';

export interface PriceComparisonProductData {
  id: string;
  display_name: string;
  code_13_ref: string;
  brand_lab?: string;
  category?: string;
  price: number;
  avg_price: number;
  min_price: number;
  max_price: number;
  price_difference_percentage: number;
}

interface PriceComparisonData {
  veryLowPrice: PriceComparisonProductData[];
  lowPrice: PriceComparisonProductData[];
  averagePrice: PriceComparisonProductData[];
  highPrice: PriceComparisonProductData[];
  veryHighPrice: PriceComparisonProductData[];
  isLoading: boolean;
  error: string | null;
}

export function usePriceComparison(): PriceComparisonData {
  const [data, setData] = useState<PriceComparisonData>({
    veryLowPrice: [],
    lowPrice: [],
    averagePrice: [],
    highPrice: [],
    veryHighPrice: [],
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
    
    // Vérifier les prérequis
    if (!startDate || !endDate) {
      console.log('🔍 usePriceComparison: Dates manquantes, pas de chargement');
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: "Dates de période manquantes"
      }));
      return;
    }
    
    // Si aucun produit n'est sélectionné alors que le filtre est actif, on retourne des tableaux vides
    if (isFilterActive && selectedCodes.length === 0) {
      console.log('🔍 usePriceComparison: Aucun produit sélectionné avec filtre actif');
      setData(prev => ({
        ...prev,
        isLoading: false
      }));
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 usePriceComparison: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchPriceComparison();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchPriceComparison = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 usePriceComparison: Début du chargement de la comparaison de prix');
    
    try {
      const abortSignal = createAbortSignal();
      
      const response = await fetch('/api/products/price-comparison', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pharmacyIds: selectedPharmacyIds.length > 0 ? selectedPharmacyIds : [],
          code13refs: isFilterActive ? selectedCodes : [],
          startDate: startDate,
          endDate: endDate
        }),
        cache: 'no-store',
        signal: abortSignal
      });
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 usePriceComparison: Requête annulée');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des données');
      }
      
      const result = await response.json();
      
      setData({
        veryLowPrice: result.veryLowPrice || [],
        lowPrice: result.lowPrice || [],
        averagePrice: result.averagePrice || [],
        highPrice: result.highPrice || [],
        veryHighPrice: result.veryHighPrice || [],
        isLoading: false,
        error: null
      });
      
      console.log('✅ usePriceComparison: Comparaison de prix chargée avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 usePriceComparison: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ usePriceComparison: Erreur lors de la récupération des données:', error);
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