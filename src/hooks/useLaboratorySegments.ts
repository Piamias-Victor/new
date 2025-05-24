// src/hooks/useLaboratorySegments.ts
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useDataLoading } from '@/contexts/DataLoadingContext';

export interface Segment {
  id: string;
  name: string;
  universe: string;
  category: string;
  segment_type: string; // Type de segment (universe, category, etc.)
  product_count: number;
  total_revenue: number;
  total_margin: number;
  total_quantity: number;
  market_share: number;
  volume_share: number;
}

export interface LaboratorySegmentsData {
  laboratory: {
    id: string;
    name: string;
    total_revenue: number;
    total_margin: number;
    total_quantity: number;
    product_count: number;
  };
  segments: Segment[];
  isLoading: boolean;
  error: string | null;
}

export function useLaboratorySegments(laboratoryId: string): LaboratorySegmentsData {
  const [data, setData] = useState<LaboratorySegmentsData>({
    laboratory: {
      id: '',
      name: '',
      total_revenue: 0,
      total_margin: 0,
      total_quantity: 0,
      product_count: 0
    },
    segments: [],
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
    if (!laboratoryId || !startDate || !endDate) {
      console.log('🔍 useLaboratorySegments: Prérequis manquants, pas de chargement');
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useLaboratorySegments: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchLaboratorySegments();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchLaboratorySegments = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useLaboratorySegments: Début du chargement des segments de laboratoire');
    
    try {
      const abortSignal = createAbortSignal();
      
      // Préparer le corps de la requête
      const requestBody = {
        startDate,
        endDate,
        pharmacyIds: selectedPharmacyIds.length > 0 ? selectedPharmacyIds : [],
        includeAllSegmentTypes: true 
      };
      
      // Effectuer la requête POST
      const response = await fetch(`/api/laboratories/${laboratoryId}/segments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        cache: 'no-store',
        signal: abortSignal
      });
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useLaboratorySegments: Requête annulée');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des données');
      }
      
      const result = await response.json();
      
      setData({
        laboratory: result.laboratory || {
          id: laboratoryId,
          name: '',
          total_revenue: 0,
          total_margin: 0,
          total_quantity: 0,
          product_count: 0
        },
        segments: result.segments || [],
        isLoading: false,
        error: null
      });
      
      console.log('✅ useLaboratorySegments: Segments de laboratoire chargés avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useLaboratorySegments: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useLaboratorySegments: Erreur lors de la récupération des segments:', error);
      setData({
        laboratory: {
          id: laboratoryId,
          name: '',
          total_revenue: 0,
          total_margin: 0,
          total_quantity: 0,
          product_count: 0
        },
        segments: [],
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