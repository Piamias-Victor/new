// src/hooks/useGroupingComparison.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useProductFilter } from '@/contexts/ProductFilterContext';

interface PharmacyData {
  total_sellout: number;
  total_margin: number;
  margin_percentage: number;
  references_count: number;
  total_sellin: number;
  total_stock: number;
  evolution_percentage: number;
  // Propriétés pour les pourcentages et totaux
  sellout_percentage: number;
  sellin_percentage: number;
  margin_percentage_of_total: number;
  stock_percentage: number;
  total_pharmacy_sellout: number;
  total_pharmacy_sellin: number;
  total_pharmacy_margin: number;
  total_pharmacy_stock: number;
}

interface GroupData {
  pharmacy_count: number;
  avg_sellout: number;
  avg_margin: number;
  avg_margin_percentage: number;
  avg_references_count: number;
  avg_sellin: number;
  avg_stock: number;
  avg_evolution_percentage: number;
  // Propriétés pour les pourcentages et totaux
  total_group_sellout: number;
  total_group_sellin: number;
  total_group_margin: number;
  total_group_stock: number;
  sellout_percentage: number;
  sellin_percentage: number;
  margin_percentage: number;
  stock_percentage: number;
}

interface ComparisonData {
  pharmacy: PharmacyData;
  group: GroupData;
  isLoading: boolean;
  error: string | null;
}

export function useGroupingComparison(pharmacyId: string): ComparisonData {
  const [data, setData] = useState<ComparisonData>({
    pharmacy: {
      total_sellout: 0,
      total_margin: 0,
      margin_percentage: 0,
      references_count: 0,
      total_sellin: 0,
      total_stock: 0,
      evolution_percentage: 0,
      sellout_percentage: 0,
      sellin_percentage: 0,
      margin_percentage_of_total: 0,
      stock_percentage: 0,
      total_pharmacy_sellout: 0,
      total_pharmacy_sellin: 0,
      total_pharmacy_margin: 0,
      total_pharmacy_stock: 0
    },
    group: {
      pharmacy_count: 0,
      avg_sellout: 0,
      avg_margin: 0,
      avg_margin_percentage: 0,
      avg_references_count: 0,
      avg_sellin: 0,
      avg_stock: 0,
      avg_evolution_percentage: 0,
      total_group_sellout: 0,
      total_group_sellin: 0,
      total_group_margin: 0,
      total_group_stock: 0,
      sellout_percentage: 0,
      sellin_percentage: 0,
      margin_percentage: 0,
      stock_percentage: 0
    },
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate } = useDateRange();
  const { selectedCodes, isFilterActive } = useProductFilter();
  
  useEffect(() => {
    async function fetchComparisonData() {
      if (!pharmacyId || !startDate || !endDate) {
        return;
      }
      
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Déterminer si on doit utiliser POST ou GET
        const shouldUsePost = isFilterActive && (selectedCodes.length > 20);
        let response;

        if (shouldUsePost) {
          response = await fetch('/api/pharmacy/grouping-comparison', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pharmacyId,
              startDate,
              endDate,
              code13refs: isFilterActive ? selectedCodes : [],
              includeTotals: true // Paramètre pour inclure les totaux
            }),
            cache: 'no-store'
          });
        } else {
          const params = new URLSearchParams({
            pharmacyId,
            startDate,
            endDate,
            includeTotals: 'true'
          });
          
          if (isFilterActive && selectedCodes.length > 0) {
            selectedCodes.forEach(code => {
              params.append('code13refs', code);
            });
          }
          
          response = await fetch(`/api/pharmacy/grouping-comparison?${params}`, {
            cache: 'no-store'
          });
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des données');
        }
        
        const result = await response.json();
        
        setData({
          pharmacy: result.pharmacy,
          group: result.group,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur dans useGroupingComparison:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }));
      }
    }
    
    fetchComparisonData();
  }, [pharmacyId, startDate, endDate, selectedCodes, isFilterActive]);
  
  return data;
}