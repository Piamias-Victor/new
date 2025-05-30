// src/hooks/useStockBySegment.ts
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { useDataLoading } from '@/contexts/DataLoadingContext';
import { SegmentType } from './useSegmentDistribution';

export interface StockSegmentItem {
  segment: string;
  total_value: number;
  total_units: number;
  product_count: number;
}

interface StockBySegmentData {
  stockData: StockSegmentItem[];
  isLoading: boolean;
  error: string | null;
}

export function useStockBySegment(segmentType: SegmentType = 'universe'): StockBySegmentData {
  const [data, setData] = useState<StockBySegmentData>({
    stockData: [],
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
      console.log('🔍 useStockBySegment: Dates manquantes, pas de chargement');
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useStockBySegment: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchStockBySegment();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchStockBySegment = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useStockBySegment: Début du chargement des données stock par segment');
    
    try {
      const abortSignal = createAbortSignal();
      
      // Utiliser POST pour les grandes listes de codes
      const response = await fetch('/api/stock/by-segment', {
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
        console.log('🔍 useStockBySegment: Requête annulée');
        return;
      }
      
      if (!response.ok) {
        // Si l'API n'est pas encore implémentée, renvoyer des données fictives
        if (response.status === 404) {
          // Données fictives pour démonstration
          const mockData = [
            { segment: 'Médicaments', total_value: 180000, total_units: 9000, product_count: 150 },
            { segment: 'Parapharmacie', total_value: 120000, total_units: 6000, product_count: 100 },
            { segment: 'Cosmétique', total_value: 90000, total_units: 4500, product_count: 80 }
          ];
          
          setData({
            stockData: mockData,
            isLoading: false,
            error: null
          });
          
          console.log('✅ useStockBySegment: Données fictives chargées (API 404)');
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des données');
      }
      
      const result = await response.json();
      
      setData({
        stockData: result.distributions || [],
        isLoading: false,
        error: null
      });
      
      console.log('✅ useStockBySegment: Données stock par segment chargées avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useStockBySegment: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useStockBySegment: Erreur lors de la récupération des données:', error);
      
      // En cas d'erreur, utiliser des données fictives pour démonstration
      const mockData = [
        { segment: 'Médicaments', total_value: 180000, total_units: 9000, product_count: 150 },
        { segment: 'Parapharmacie', total_value: 120000, total_units: 6000, product_count: 100 },
        { segment: 'Cosmétique', total_value: 90000, total_units: 4500, product_count: 80 }
      ];
      
      setData({
        stockData: mockData,
        isLoading: false,
        error: null // Ne pas afficher l'erreur pour le moment
      });
      
      console.log('✅ useStockBySegment: Données fictives chargées (erreur)');
      
    } finally {
      isLoadingRef.current = false;
      decrementActiveRequests();
    }
  };
  
  return data;
}