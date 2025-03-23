// src/hooks/useStockEvolutionWithFilter.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';

export interface StockEvolutionItem {
  period: string;
  stockQuantity: number;
  stockValue: number;
  ruptureQuantity: number;
  isRupture: boolean;
}

interface StockEvolutionData {
  data: StockEvolutionItem[];
  isLoading: boolean;
  error: string | null;
}

export function useStockEvolutionWithFilter(interval: 'day' | 'week' | 'month' = 'day'): StockEvolutionData {
  const [data, setData] = useState<StockEvolutionData>({
    data: [],
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  const { selectedCodes, isFilterActive } = useProductFilter();
  
  useEffect(() => {
    async function fetchStockEvolution() {
      if (!startDate || !endDate) return;
      
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const shouldUsePost = isFilterActive && selectedCodes.length > 20;
        let response;
        
        if (shouldUsePost) {
          response = await fetch('/api/stock/evolution', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              startDate,
              endDate,
              interval,
              pharmacyIds: selectedPharmacyIds.length > 0 ? selectedPharmacyIds : [],
              code13refs: isFilterActive ? selectedCodes : []
            }),
            cache: 'no-store'
          });
        } else {
          const params = new URLSearchParams({
            startDate,
            endDate,
            interval
          });
          
          if (selectedPharmacyIds.length > 0) {
            selectedPharmacyIds.forEach(id => params.append('pharmacyIds', id));
          }
          
          if (isFilterActive && selectedCodes.length > 0) {
            selectedCodes.forEach(code => params.append('code13refs', code));
          }
          
          response = await fetch(`/api/stock/evolution?${params}`, { cache: 'no-store' });
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des données');
        }
        
        const result = await response.json();
        
        setData({
          data: result.data || [],
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur dans useStockEvolutionWithFilter:', error);
        setData({
          data: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
    
    fetchStockEvolution();
  }, [startDate, endDate, selectedPharmacyIds, interval, selectedCodes, isFilterActive]);
  
  return data;
}