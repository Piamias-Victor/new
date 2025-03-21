// src/hooks/useSegmentEvolution.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { SegmentType } from './useSegmentDistribution';

export interface SegmentEvolutionItem {
  segment: string;
  current_revenue: number;
  previous_revenue: number;
  evolution_percentage: number;
}

export function useSegmentEvolution(segmentType: SegmentType = 'universe') {
  const [evolutionData, setEvolutionData] = useState<SegmentEvolutionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { startDate, endDate, comparisonStartDate, comparisonEndDate, isComparisonEnabled } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  const { selectedCodes, isFilterActive } = useProductFilter();
  
  useEffect(() => {
    async function fetchData() {
      if (!startDate || !endDate || !isComparisonEnabled || !comparisonStartDate || !comparisonEndDate) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/sales/segment-evolution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate,
            endDate,
            comparisonStartDate,
            comparisonEndDate,
            segmentType,
            pharmacyIds: selectedPharmacyIds,
            code13refs: isFilterActive ? selectedCodes : []
          })
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }
        
        const result = await response.json();
        setEvolutionData(result.data || []);
      } catch (err) {
        console.error('Erreur dans useSegmentEvolution:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        setEvolutionData([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [startDate, endDate, comparisonStartDate, comparisonEndDate, segmentType, 
      selectedPharmacyIds, selectedCodes, isFilterActive, isComparisonEnabled]);
  
  return { evolutionData, isLoading, error };
}