// src/hooks/useGlobalStatistics.ts
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useDataLoading } from '@/contexts/DataLoadingContext';

interface GlobalStatistics {
  uniqueProducts: number;
  uniqueLabs: number;
  uniqueCategories: number;
  totalSales: number;
}

interface GlobalStatisticsResponse {
  statistics: GlobalStatistics;
  isLoading: boolean;
  error: string | null;
}

export function useGlobalStatistics(): GlobalStatisticsResponse {
  const [data, setData] = useState<GlobalStatisticsResponse>({
    statistics: {
      uniqueProducts: 0,
      uniqueLabs: 0,
      uniqueCategories: 0,
      totalSales: 0
    },
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
    if (!startDate || !endDate) {
      console.log('🔍 useGlobalStatistics: Dates manquantes, pas de chargement');
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useGlobalStatistics: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchGlobalStatistics();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchGlobalStatistics = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useGlobalStatistics: Début du chargement des statistiques globales');
    
    try {
      const abortSignal = createAbortSignal();
      
      // Préparer les paramètres de la requête
      const params = new URLSearchParams({
        startDate,
        endDate
      });
      
      // Si on a une sélection spécifique, on l'ajoute aux paramètres
      if (selectedPharmacyIds.length > 0) {
        selectedPharmacyIds.forEach(id => {
          params.append('pharmacyIds', id);
        });
      }
      
      // Effectuer la requête
      const response = await fetch(`/api/statistics/global?${params}`, {
        cache: 'no-store',
        signal: abortSignal
      });
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useGlobalStatistics: Requête annulée');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des statistiques');
      }
      
      const result = await response.json();
      
      setData({
        statistics: result.statistics,
        isLoading: false,
        error: null
      });
      
      console.log('✅ useGlobalStatistics: Statistiques chargées avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useGlobalStatistics: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useGlobalStatistics: Erreur lors de la récupération des statistiques:', error);
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