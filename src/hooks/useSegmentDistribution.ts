// src/hooks/useSegmentDistribution.ts
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { useDataLoading } from '@/contexts/DataLoadingContext';

export type SegmentType = 'universe' | 'category' | 'sub_category' | 'brand_lab' | 
                        'family' | 'sub_family' | 'range_name';

export interface SegmentDistributionItem {
  segment: string;
  total_revenue: number;
  total_margin: number;
  margin_percentage: number;
  total_quantity: number;
  product_count: number;
  revenue_percentage: number;
}

interface SegmentDistributionData {
  distributions: SegmentDistributionItem[];
  totalRevenue: number;
  segmentType: SegmentType;
  isLoading: boolean;
  error: string | null;
}

// Limite au-delà de laquelle on utilise POST au lieu de GET
const URL_LENGTH_LIMIT = 2000;

export function useSegmentDistribution(segmentType: SegmentType = 'universe'): SegmentDistributionData {
  const [data, setData] = useState<SegmentDistributionData>({
    distributions: [],
    totalRevenue: 0,
    segmentType,
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
      console.log('🔍 useSegmentDistribution: Dates manquantes, pas de chargement');
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useSegmentDistribution: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchSegmentDistribution();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchSegmentDistribution = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useSegmentDistribution: Début du chargement de la distribution de segments');
    
    try {
      const abortSignal = createAbortSignal();
      
      let response;
      
      // Détermine si on doit utiliser GET ou POST en fonction de la taille des données
      const shouldUsePost = isFilterActive && selectedCodes.length > 20;
      
      if (shouldUsePost) {
        // Utiliser POST pour les grandes listes de codes
        response = await fetch('/api/sales/segment-distribution', {
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
      } else {
        // Préparer les paramètres pour GET
        const params = new URLSearchParams({
          startDate,
          endDate,
          segmentType
        });
        
        // Si on a une sélection spécifique de pharmacies
        if (selectedPharmacyIds.length > 0) {
          selectedPharmacyIds.forEach(id => {
            params.append('pharmacyIds', id);
          });
        }
        
        // Si on a une sélection de codes EAN13
        if (isFilterActive && selectedCodes.length > 0) {
          selectedCodes.forEach(code => {
            params.append('code13refs', code);
          });
        }
        
        // Effectuer la requête GET
        response = await fetch(`/api/sales/segment-distribution?${params}`, {
          cache: 'no-store',
          signal: abortSignal
        });
      }
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useSegmentDistribution: Requête annulée');
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
        segmentType,
        isLoading: false,
        error: null
      });
      
      console.log('✅ useSegmentDistribution: Distribution de segments chargée avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useSegmentDistribution: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useSegmentDistribution: Erreur lors de la récupération des données:', error);
      setData({
        distributions: [],
        totalRevenue: 0,
        segmentType,
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