// src/hooks/useProductGroupingComparison.ts
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useDataLoading } from '@/contexts/DataLoadingContext';

export interface ProductGroupingData {
  price: {
    yourValue: number;
    average: number;
    maximum: number;
    minimum: number;
    percentage: number;
  };
  margin: {
    yourValue: number;
    average: number;
    maximum: number;
    minimum: number;
    percentage: number;
  };
  rotation: {
    yourValue: number;
    average: number;
    maximum: number;
    minimum: number;
    percentage: number;
  };
  stock: {
    yourValue: number;
    average: number;
    maximum: number;
    minimum: number;
    percentage: number;
  };
  sales: {
    yourValue: number;
    average: number;
    maximum: number;
    minimum: number;
    percentage: number;
  };
  isLoading: boolean;
  error: string | null;
}

export function useProductGroupingComparison(code13ref: string): ProductGroupingData {
  const [data, setData] = useState<ProductGroupingData>({
    price: { yourValue: 0, average: 0, maximum: 0, minimum: 0, percentage: 0 },
    margin: { yourValue: 0, average: 0, maximum: 0, minimum: 0, percentage: 0 },
    rotation: { yourValue: 0, average: 0, maximum: 0, minimum: 0, percentage: 0 },
    stock: { yourValue: 0, average: 0, maximum: 0, minimum: 0, percentage: 0 },
    sales: { yourValue: 0, average: 0, maximum: 0, minimum: 0, percentage: 0 },
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
    if (!code13ref || !startDate || !endDate) {
      console.log('🔍 useProductGroupingComparison: Prérequis manquants, pas de chargement');
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useProductGroupingComparison: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchGroupingComparison();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchGroupingComparison = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useProductGroupingComparison: Début du chargement de la comparaison de groupement produit');
    
    try {
      const abortSignal = createAbortSignal();
      
      // Construire les paramètres pour la requête
      const params = new URLSearchParams({
        startDate,
        endDate,
        code13ref
      });
      
      // Ajouter les IDs des pharmacies sélectionnées
      if (selectedPharmacyIds.length > 0) {
        selectedPharmacyIds.forEach(id => {
          params.append('pharmacyIds', id);
        });
      }
      
      // Effectuer la requête
      const response = await fetch(`/api/products/grouping-comparison?${params}`, {
        cache: 'no-store',
        signal: abortSignal
      });
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useProductGroupingComparison: Requête annulée');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données de comparaison');
      }
      
      const result = await response.json();
      
      setData({
        ...result,
        isLoading: false,
        error: null
      });
      
      console.log('✅ useProductGroupingComparison: Comparaison de groupement produit chargée avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useProductGroupingComparison: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useProductGroupingComparison: Erreur lors de la récupération des données:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération des données de comparaison'
      }));
    } finally {
      isLoadingRef.current = false;
      decrementActiveRequests();
    }
  };
  
  return data;
}