// src/hooks/usePharmacySalesEvolution.ts (mise à jour)
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useProductFilter } from '@/contexts/ProductFilterContext';

export interface SalesDataItem {
  period: string;
  revenue: number;
  margin: number;
  margin_percentage: number;
  quantity: number;
}

interface PharmacySalesEvolutionState {
  data: SalesDataItem[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook personnalisé pour récupérer l'évolution des ventes d'une pharmacie spécifique
 * Prend en compte la sélection de produits active
 */
export function usePharmacySalesEvolution(
  pharmacyId: string,
  interval: 'day' | 'week' | 'month' = 'day'
): PharmacySalesEvolutionState {
  const [state, setState] = useState<PharmacySalesEvolutionState>({
    data: [],
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate } = useDateRange();
  const { selectedCodes, isFilterActive } = useProductFilter();
  
  useEffect(() => {
    async function fetchPharmacySalesEvolution() {
      // Vérifier que les dates et l'ID de pharmacie sont disponibles
      if (!startDate || !endDate || !pharmacyId) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        // Utiliser une requête POST si nous avons des codes EAN13 sélectionnés
        if (isFilterActive && selectedCodes.length > 0) {
          const response = await fetch(`/api/pharmacie/${pharmacyId}/sales/evolution`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              startDate,
              endDate,
              interval,
              code13refs: selectedCodes
            }),
            cache: 'no-store'
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de la récupération des données');
          }
          
          const result = await response.json();
          
          setState({
            data: result.data || [],
            isLoading: false,
            error: null
          });
        } else {
          // Sinon, utiliser une requête GET
          const params = new URLSearchParams({
            startDate,
            endDate,
            interval
          });
          
          const response = await fetch(`/api/pharmacie/${pharmacyId}/sales/evolution?${params}`, {
            cache: 'no-store'
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de la récupération des données');
          }
          
          const result = await response.json();
          
          setState({
            data: result.data || [],
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Erreur dans usePharmacySalesEvolution:', error);
        setState({
          data: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
    
    fetchPharmacySalesEvolution();
  }, [pharmacyId, startDate, endDate, interval, selectedCodes, isFilterActive]);
  
  return state;
}