// src/hooks/useRevenueWithFilter.ts (Version contrôlée)
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { useDataLoading } from '@/contexts/DataLoadingContext';

interface RevenueData {
  totalRevenue: number;
  totalMargin: number;
  totalQuantity: number;
  marginPercentage: number;
  uniqueReferences: number;
  comparison: {
    totalRevenue: number;
    totalMargin: number;
    totalQuantity: number;
    marginPercentage: number;
    uniqueReferences: number;
    evolution: {
      revenue: { percentage: number; isPositive: boolean; displayValue: string };
      margin: { percentage: number; isPositive: boolean; displayValue: string };
      quantity: { percentage: number; isPositive: boolean; displayValue: string };
      marginPercentage: { points: number; isPositive: boolean; displayValue: string };
      uniqueReferences: { percentage: number; isPositive: boolean; displayValue: string };
    },
    actualDateRange?: { min: string; max: string; days: number };
  };
  isComparisonEnabled: boolean;
  actualDateRange?: { min: string; max: string; days: number };
  isLoading: boolean;
  error: string | null;
}

export function useRevenueWithFilter() {
  const [data, setData] = useState<RevenueData>({
    totalRevenue: 0,
    totalMargin: 0,
    totalQuantity: 0,
    marginPercentage: 0,
    uniqueReferences: 0,
    comparison: {
      totalRevenue: 0,
      totalMargin: 0,
      totalQuantity: 0,
      marginPercentage: 0,
      uniqueReferences: 0,
      evolution: {
        revenue: { percentage: 0, isPositive: true, displayValue: '+0.0%' },
        margin: { percentage: 0, isPositive: true, displayValue: '+0.0%' },
        quantity: { percentage: 0, isPositive: true, displayValue: '+0.0%' },
        marginPercentage: { points: 0, isPositive: true, displayValue: '+0.0 pts' },
        uniqueReferences: { percentage: 0, isPositive: true, displayValue: '+0.0%' }
      }
    },
    isComparisonEnabled: true,
    isLoading: false,
    error: null
  });
  
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
    if (!startDate || !endDate) {
      console.log('🔍 useRevenue: Dates manquantes, pas de chargement');
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useRevenue: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchData();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchData = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useRevenue: Début du chargement des données revenue');
    
    try {
      const abortSignal = createAbortSignal();
      
      const response = await fetch('/api/kpi/sell-out', {
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
          code13refs: isFilterActive ? selectedCodes : undefined
        }),
        signal: abortSignal, // Ajout du signal d'abort
      });
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useRevenue: Requête annulée');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données de vente');
      }
      
      const jsonData = await response.json();
      
      // Calculer le nombre de jours dans la période
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      const daysInPeriod = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const newData = {
        totalRevenue: jsonData.current.revenue,
        totalMargin: jsonData.current.margin,
        totalQuantity: jsonData.current.quantity,
        marginPercentage: jsonData.current.marginPercentage,
        uniqueReferences: jsonData.current.uniqueReferences,
        comparison: jsonData.comparison,
        isComparisonEnabled,
        actualDateRange: {
          min: jsonData.actualDateRange?.min || startDate,
          max: jsonData.actualDateRange?.max || endDate,
          days: jsonData.actualDateRange?.days || daysInPeriod
        },
        isLoading: false,
        error: null
      };
      
      setData(newData);
      console.log('✅ useRevenue: Données chargées avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useRevenue: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useRevenue: Erreur lors de la récupération des données:', error);
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