// src/hooks/useSegmentAnalysis.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

export interface TopProduct {
  id: string;
  product_id: string;
  name: string;
  display_name: string;
  code_13_ref: string;
  brand_lab: string;
  total_quantity: number;
  total_revenue: number;
  total_margin: number;
  margin_percentage: number;
  current_stock?: number;
}

export interface LaboratoryMarketShare {
  id: string;
  name: string;
  total_revenue: number;
  market_share: number; // Pourcentage du marché
  product_count: number;
  rank: number; // Position dans le classement
}

export interface SegmentAnalysisData {
  segmentInfo: {
    id: string;
    name: string;
    universe: string;
    category: string;
    total_revenue: number;
  };
  selectedLabProductsTop: TopProduct[]; // Top produits du laboratoire dans ce segment
  otherLabsProductsTop: TopProduct[]; // Top produits hors laboratoire sélectionné
  marketShareByLab: LaboratoryMarketShare[]; // Part de marché des laboratoires
  isLoading: boolean;
  error: string | null;
}

export function useSegmentAnalysis(segmentId: string, laboratoryId: string): SegmentAnalysisData {
  const [data, setData] = useState<SegmentAnalysisData>({
    segmentInfo: {
      id: '',
      name: '',
      universe: '',
      category: '',
      total_revenue: 0
    },
    selectedLabProductsTop: [],
    otherLabsProductsTop: [],
    marketShareByLab: [],
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  
  useEffect(() => {
    async function fetchSegmentAnalysis() {
      if (!segmentId || !laboratoryId || !startDate || !endDate) {
        return;
      }
      
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        // Préparer le corps de la requête
        const requestBody = {
          startDate,
          endDate,
          laboratoryId,
          pharmacyIds: selectedPharmacyIds.length > 0 ? selectedPharmacyIds : [],
          limit: 10 // Valeur par défaut
        };
        
        // Effectuer la requête POST
        const response = await fetch(`/api/segments/${segmentId}/analysis`, {
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
          segmentInfo: result.segmentInfo || {
            id: segmentId,
            name: '',
            universe: '',
            category: '',
            total_revenue: 0
          },
          selectedLabProductsTop: result.selectedLabProductsTop || [],
          otherLabsProductsTop: result.otherLabsProductsTop || [],
          marketShareByLab: result.marketShareByLab || [],
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur dans useSegmentAnalysis:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }));
      }
    }
    
    fetchSegmentAnalysis();
  }, [segmentId, laboratoryId, startDate, endDate, selectedPharmacyIds]);
  
  return data;
}