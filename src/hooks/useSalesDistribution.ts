// src/hooks/useSalesDistribution.ts
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useDataLoading } from '@/contexts/DataLoadingContext';

export interface SalesDistributionItem {
  category: string;
  total_revenue: number;
  total_margin: number;
  margin_percentage: number;
  total_quantity: number;
  revenue_percentage: number;
}

interface SalesDistributionData {
  distributions: SalesDistributionItem[];
  totalRevenue: number;
  isLoading: boolean;
  error: string | null;
}

export function useSalesDistribution(): SalesDistributionData {
  const [data, setData] = useState<SalesDistributionData>({
    distributions: [],
    totalRevenue: 0,
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
      console.log('🔍 useSalesDistribution: Dates manquantes, pas de chargement');
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useSalesDistribution: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchSalesDistribution();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchSalesDistribution = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useSalesDistribution: Début du chargement de la distribution des ventes');
    
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
      const response = await fetch(`/api/sales/distribution?${params}`, {
        cache: 'no-store',
        signal: abortSignal
      });
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useSalesDistribution: Requête annulée');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des données');
      }
      
      const result = await response.json();
      
      // Calculer le total des revenus
      const totalRevenue = Array.isArray(result.distributions)
        ? result.distributions.reduce((sum, item) => sum + parseFloat(item.total_revenue), 0)
        : 0;
      
      setData({
        distributions: result.distributions || [],
        totalRevenue,
        isLoading: false,
        error: null
      });
      
      console.log('✅ useSalesDistribution: Distribution des ventes chargée avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useSalesDistribution: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useSalesDistribution: Erreur lors de la récupération des données:', error);
      setData({
        distributions: [],
        totalRevenue: 0,
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