// src/hooks/usePharmaciesData.ts
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { useDataLoading } from '@/contexts/DataLoadingContext';

export interface PharmacyDetailData {
  id: string;
  name: string;
  area: string;
  sell_out_price_ttc: number;
  sell_in_price_ht: number;
  margin_percentage: number;
  margin_amount: number;
  stock_value_ht: number;
  stock_quantity: number;
  sales_quantity: number;
  previous_sales_quantity: number;
  sales_evolution_percentage: number;
  total_sell_out: number;
  total_sell_in: number;
  product_count: number;      // Nombre de références actives
  selection_weight: number;   // Poids de la sélection dans le CA global
}

export function usePharmaciesData() {
  const [pharmacies, setPharmacies] = useState<PharmacyDetailData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Contextes
  const { startDate, endDate, comparisonStartDate, comparisonEndDate } = useDateRange();
  const { selectedCodes } = useProductFilter();
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
      console.log('🔍 usePharmaciesData: Dates manquantes, pas de chargement');
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 usePharmaciesData: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchPharmaciesData();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchPharmaciesData = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setIsLoading(true);
    setError(null);
    
    console.log('🔍 usePharmaciesData: Début du chargement des données pharmacies');
    
    try {
      const abortSignal = createAbortSignal();
      
      const response = await fetch('/api/products/pharmacies/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          comparisonStartDate,
          comparisonEndDate,
          code13refs: selectedCodes
        }),
        signal: abortSignal
      });
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 usePharmaciesData: Requête annulée');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données pharmacies');
      }
      
      const data = await response.json();
      setPharmacies(data.pharmacies || []);
      
      console.log('✅ usePharmaciesData: Données pharmacies chargées avec succès');
      
    } catch (err) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('🔍 usePharmaciesData: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ usePharmaciesData: Erreur lors de la récupération des données:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      isLoadingRef.current = false;
      decrementActiveRequests();
      setIsLoading(false);
    }
  };
  
  return { pharmacies, isLoading, error };
}