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
        // Utiliser POST si nous avons beaucoup de codes EAN ou si le filtre est actif
        const shouldUsePost = isFilterActive && (selectedCodes.length > 20);
        let response;

        if (shouldUsePost) {
          // Utiliser POST pour éviter les URL trop longs
          response = await fetch('/api/pharmacy/grouping-comparison', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pharmacyId,
              startDate,
              endDate,
              code13refs: isFilterActive ? selectedCodes : []
            }),
            cache: 'no-store'
          });
        } else {
          // Pour les cas simples avec peu de codes, on peut utiliser GET
          const params = new URLSearchParams({
            pharmacyId,
            startDate,
            endDate
          });
          
          // Ajouter les codes EAN13 si le filtre est actif
          if (isFilterActive && selectedCodes.length > 0) {
            selectedCodes.forEach(code => {
              params.append('code13refs', code);
            });
          }
          
          // Effectuer la requête
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