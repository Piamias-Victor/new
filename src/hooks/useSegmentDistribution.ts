// src/hooks/useSegmentDistribution.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';

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

export function useSegmentDistribution(segmentType: SegmentType = 'universe'): SegmentDistributionData {
  const [data, setData] = useState<SegmentDistributionData>({
    distributions: [],
    totalRevenue: 0,
    segmentType,
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  const { selectedCodes, isFilterActive } = useProductFilter();
  
  useEffect(() => {
    async function fetchSegmentDistribution() {
      // Vérifier que les dates sont disponibles
      if (!startDate || !endDate) {
        return;
      }
      
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Préparer les paramètres de la requête
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
        
        // Effectuer la requête
        const response = await fetch(`/api/sales/segment-distribution?${params}`, {
          cache: 'no-store'
        });
        
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
      } catch (error) {
        console.error('Erreur dans useSegmentDistribution:', error);
        setData({
          distributions: [],
          totalRevenue: 0,
          segmentType,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
    
    fetchSegmentDistribution();
  }, [startDate, endDate, selectedPharmacyIds, segmentType, selectedCodes, isFilterActive]);
  
  return data;
}