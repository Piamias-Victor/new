// src/hooks/useSalesEvolution.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

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

export function useSalesEvolution(interval: 'day' | 'week' | 'month' = 'day'): SalesEvolutionData {
  const [data, setData] = useState<SalesEvolutionData>({
    data: [],
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  
  useEffect(() => {
    async function fetchSalesEvolution() {
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
        
        // Si on a une sélection spécifique, on l'ajoute aux paramètres
        if (selectedPharmacyIds.length > 0) {
          selectedPharmacyIds.forEach(id => {
            params.append('pharmacyIds', id);
          });
        }
        
        // Effectuer la requête
        const response = await fetch(`/api/sales/evolution?${params}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des données');
        }
        
        const result = await response.json();
        
        setData({
          data: result.data,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur dans useSalesEvolution:', error);
        setData({
          data: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
    
    fetchSalesEvolution();
  }, [startDate, endDate, selectedPharmacyIds, interval]);
  
  return data;
}