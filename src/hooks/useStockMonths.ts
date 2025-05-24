// src/hooks/useStockMonths.ts
import { useState, useEffect, useRef } from 'react';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useDataLoading } from '@/contexts/DataLoadingContext';

export interface StockProductData {
  id: string;
  product_name: string;
  global_name: string;
  display_name: string;
  category: string;
  brand_lab: string;
  code_13_ref: string;
  current_stock: number;
  avg_monthly_sales: number;
  stock_months: number;
}

interface StockMonthsData {
  criticalLow: StockProductData[];
  toWatch: StockProductData[];
  optimal: StockProductData[];
  overStock: StockProductData[];
  criticalHigh: StockProductData[];
  isLoading: boolean;
  error: string | null;
}

export function useStockMonths(): StockMonthsData {
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
  const { isReadyToLoad, createAbortSignal, incrementActiveRequests, decrementActiveRequests } = useDataLoading();
  
  // Référence pour éviter les appels multiples
  const isLoadingRef = useRef(false);
  
  useEffect(() => {
    // Ne se déclenche QUE si isReadyToLoad est true
    if (!isReadyToLoad) {
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useStockMonths: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchStockMonths();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchStockMonths = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useStockMonths: Début du chargement des données stock en mois');
    
    try {
      const abortSignal = createAbortSignal();
      
      // Préparer les paramètres de la requête
      const params = new URLSearchParams();
      
      // Si on a une sélection spécifique, on l'ajoute aux paramètres
      if (selectedPharmacyIds.length > 0) {
        selectedPharmacyIds.forEach(id => {
          params.append('pharmacyIds', id);
        });
      }
      
      // Effectuer la requête
      const response = await fetch(`/api/inventory/stock-months?${params}`, {
        cache: 'no-store',
        signal: abortSignal
      });
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useStockMonths: Requête annulée');
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
      
      console.log('✅ useStockMonths: Données stock en mois chargées avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useStockMonths: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useStockMonths: Erreur lors de la récupération des données:', error);
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