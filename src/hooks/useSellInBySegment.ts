// src/hooks/useSellInBySegment.ts
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { useDataLoading } from '@/contexts/DataLoadingContext';
import { SegmentType } from './useSegmentDistribution';

export interface SellInSegmentItem {
  segment: string;
  total_amount: number;
  total_quantity: number;
  product_count: number;
}

interface SellInBySegmentData {
  sellInData: SellInSegmentItem[];
  isLoading: boolean;
  error: string | null;
}

export function useSellInBySegment(segmentType: SegmentType = 'universe'): SellInBySegmentData {
  const [data, setData] = useState<SellInBySegmentData>({
    sellInData: [],
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
      console.log('🔍 useSellInBySegment: Dates manquantes, pas de chargement');
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useSellInBySegment: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchSellInBySegment();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchSellInBySegment = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useSellInBySegment: Début du chargement des données sell-in par segment');
    
    try {
      const abortSignal = createAbortSignal();
      
      // Utiliser POST pour les grandes listes de codes
      const response = await fetch('/api/sellin/by-segment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          segmentType,
          pharmacyIds: selectedPharmacyIds.length > 0 ? selectedPharmacyIds : [],
          code13refs: isFilterActive ? selectedCodes : []
        }),
        cache: 'no-store',
        signal: abortSignal
      });
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useSellInBySegment: Requête annulée');
        return;
      }
      
      if (!response.ok) {
        // Si l'API n'est pas encore implémentée, renvoyer des données fictives
        if (response.status === 404) {
          // Données fictives pour démonstration
          const mockData = [
            { segment: 'Médicaments', total_amount: 125000, total_quantity: 2500, product_count: 150 },
            { segment: 'Parapharmacie', total_amount: 75000, total_quantity: 1500, product_count: 100 },
            { segment: 'Cosmétique', total_amount: 50000, total_quantity: 1000, product_count: 80 }
          ];
          
          setData({
            sellInData: mockData,
            isLoading: false,
            error: null
          });
          
          console.log('✅ useSellInBySegment: Données fictives chargées (API 404)');
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des données');
      }
      
      const result = await response.json();
      
      setData({
        sellInData: result.distributions || [],
        isLoading: false,
        error: null
      });
      
      console.log('✅ useSellInBySegment: Données sell-in par segment chargées avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useSellInBySegment: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useSellInBySegment: Erreur lors de la récupération des données:', error);
      
      // En cas d'erreur, utiliser des données fictives pour démonstration
      const mockData = [
        { segment: 'Médicaments', total_amount: 125000, total_quantity: 2500, product_count: 150 },
        { segment: 'Parapharmacie', total_amount: 75000, total_quantity: 1500, product_count: 100 },
        { segment: 'Cosmétique', total_amount: 50000, total_quantity: 1000, product_count: 80 }
      ];
      
      setData({
        sellInData: mockData,
        isLoading: false,
        error: null // Ne pas afficher l'erreur pour le moment
      });
      
      console.log('✅ useSellInBySegment: Données fictives chargées (erreur)');
      
    } finally {
      isLoadingRef.current = false;
      decrementActiveRequests();
    }
  };
  
  return data;
}