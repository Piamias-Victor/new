// src/hooks/useInventoryValuationWithFilter.ts
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { useDataLoading } from '@/contexts/DataLoadingContext';

interface InventoryData {
  totalStockValueHT: number;
  totalUnits: number;
  averagePrice: number;
  stockDays: number;
  comparison: {
    totalStockValueHT: number;
    totalUnits: number;
    averagePrice: number;
    evolution: {
      stockValue: { percentage: number; isPositive: boolean; displayValue: string };
      units: { percentage: number; isPositive: boolean; displayValue: string };
      averagePrice: { percentage: number; isPositive: boolean; displayValue: string };
    }
  };
  isLoading: boolean;
  error: string | null;
}

export function useInventoryValuationWithFilter() {
  const [data, setData] = useState<InventoryData>({
    totalStockValueHT: 0,
    totalUnits: 0,
    averagePrice: 0,
    stockDays: 0,
    comparison: {
      totalStockValueHT: 0,
      totalUnits: 0,
      averagePrice: 0,
      evolution: {
        stockValue: { percentage: 0, isPositive: false, displayValue: '+0.0%' },
        units: { percentage: 0, isPositive: false, displayValue: '+0.0%' },
        averagePrice: { percentage: 0, isPositive: true, displayValue: '+0.0%' }
      }
    },
    isLoading: false,
    error: null
  });
  
  // Contextes
  const { startDate, endDate, comparisonStartDate, comparisonEndDate } = useDateRange();
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
      console.log('🔍 useInventoryValuation: Dates manquantes, pas de chargement');
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useInventoryValuation: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchData();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchData = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useInventoryValuation: Début du chargement des données de stock');
    
    try {
      const abortSignal = createAbortSignal();
      
      const response = await fetch('/api/kpi/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          comparisonStartDate: comparisonStartDate || startDate,
          comparisonEndDate: comparisonEndDate || endDate,
          pharmacyIds: selectedPharmacyIds,
          // Ajouter les codes EAN13 sélectionnés si le filtre est actif
          code13refs: isFilterActive ? selectedCodes : undefined
        }),
        signal: abortSignal
      });
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useInventoryValuation: Requête annulée');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données de stock');
      }
      
      const jsonData = await response.json();
      
      // Mettre à jour l'état avec les données reçues
      setData({
        totalStockValueHT: jsonData.current.stockValueHT,
        totalUnits: jsonData.current.stockUnits,
        averagePrice: jsonData.current.averagePrice,
        stockDays: jsonData.stockDaysInfo.stockDaysValue,
        comparison: {
          totalStockValueHT: jsonData.comparison.stockValueHT,
          totalUnits: jsonData.comparison.stockUnits,
          averagePrice: jsonData.comparison.averagePrice,
          evolution: jsonData.evolution
        },
        isLoading: false,
        error: null
      });
      
      console.log('✅ useInventoryValuation: Données de stock chargées avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useInventoryValuation: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useInventoryValuation: Erreur lors de la récupération des données de stock:', error);
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