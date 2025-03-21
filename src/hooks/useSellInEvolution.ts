// src/hooks/useSellInEvolutionWithFilter.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';

interface SellInEvolutionItem {
  period: string;
  amount: number;
  quantity: number;
}

interface SellInEvolutionData {
  data: SellInEvolutionItem[];
  isLoading: boolean;
  error: string | null;
}

export function useSellInEvolutionWithFilter(interval: 'day' | 'week' | 'month' = 'day'): SellInEvolutionData {
  const [data, setData] = useState<SellInEvolutionData>({
    data: [],
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  const { selectedCodes, isFilterActive } = useProductFilter();
  
  useEffect(() => {
    async function fetchSellInEvolution() {
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
          interval
        });
        
        // Si on a une sélection spécifique de pharmacies, on l'ajoute aux paramètres
        if (selectedPharmacyIds.length > 0) {
          selectedPharmacyIds.forEach(id => {
            params.append('pharmacyIds', id);
          });
        }
        
        // Ajouter les codes EAN13 sélectionnés si le filtre est actif
        if (isFilterActive && selectedCodes.length > 0) {
          selectedCodes.forEach(code => {
            params.append('code13refs', code);
          });
        }
        
        // Effectuer la requête
        const response = await fetch(`/api/sellin/evolution?${params}`, {
          cache: 'no-store'
        });
        
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
        console.error('Erreur dans useSellInEvolutionWithFilter:', error);
        setData({
          data: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
    
    fetchSellInEvolution();
  }, [startDate, endDate, selectedPharmacyIds, interval, selectedCodes, isFilterActive]);
  
  return data;
}