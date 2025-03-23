// src/hooks/useLaboratorySegments.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

export interface Segment {
  id: string;
  name: string;
  universe: string;
  category: string;
  product_count: number;
  total_revenue: number;
  total_margin: number;
  market_share: number; // Part de marché du labo dans ce segment
}

export interface LaboratorySegmentsData {
  laboratory: {
    id: string;
    name: string;
    total_revenue: number;
    total_margin: number;
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
      product_count: 0
    },
    segments: [],
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  
  useEffect(() => {
    async function fetchLaboratorySegments() {
      if (!laboratoryId || !startDate || !endDate) {
        return;
      }
      
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        // Préparer le corps de la requête
        const requestBody = {
          startDate,
          endDate,
          pharmacyIds: selectedPharmacyIds.length > 0 ? selectedPharmacyIds : []
        };
        
        // Effectuer la requête POST
        const response = await fetch(`/api/laboratories/${laboratoryId}/segments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          cache: 'no-store'
        });
        
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
            product_count: 0
          },
          segments: result.segments || [],
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur dans useLaboratorySegments:', error);
        setData({
          laboratory: {
            id: laboratoryId,
            name: '',
            total_revenue: 0,
            total_margin: 0,
            product_count: 0
          },
          segments: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
    
    fetchLaboratorySegments();
  }, [laboratoryId, startDate, endDate, selectedPharmacyIds]);
  
  return data;
}