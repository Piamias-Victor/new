// src/hooks/useSalesEvolution.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';

interface SalesEvolutionItem {
  period: string;
  revenue: number;
  margin: number;
  margin_percentage: number;
}

interface SalesEvolutionData {
  data: SalesEvolutionItem[];
  isLoading: boolean;
  error: string | null;
}

export function useSalesEvolutionWithFilter(interval: 'day' | 'week' | 'month' = 'day'): SalesEvolutionData {
  const [data, setData] = useState<SalesEvolutionData>({
    data: [],
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  const { selectedCodes, isFilterActive } = useProductFilter();
  
  useEffect(() => {
    async function fetchSalesEvolution() {
      // Vérifier que les dates sont disponibles
      if (!startDate || !endDate) {
        return;
      }
      
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        let response;
        
        // Détermine si on doit utiliser GET ou POST en fonction de la taille des données
        const shouldUsePost = isFilterActive && selectedCodes.length > 20;
        
        if (shouldUsePost) {
          // Utiliser POST pour les grandes listes de codes
          response = await fetch('/api/sales/evolution', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
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
          // Préparer les paramètres pour GET
          const params = new URLSearchParams({
            startDate,
            endDate,
            interval
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
          response = await fetch(`/api/sales/evolution?${params}`, {
            cache: 'no-store'
          });
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
        console.error('Erreur dans useSalesEvolutionWithFilter:', error);
        setData({
          data: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
    
    fetchSalesEvolution();
  }, [startDate, endDate, selectedPharmacyIds, interval, selectedCodes, isFilterActive]);
  
  return data;
}