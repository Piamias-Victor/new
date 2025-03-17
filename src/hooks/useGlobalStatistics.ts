// src/hooks/useGlobalStatistics.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

interface GlobalStatistics {
  uniqueProducts: number;
  uniqueLabs: number;
  uniqueCategories: number;
  totalSales: number;
}

interface GlobalStatisticsResponse {
  statistics: GlobalStatistics;
  isLoading: boolean;
  error: string | null;
}

export function useGlobalStatistics(): GlobalStatisticsResponse {
  const [data, setData] = useState<GlobalStatisticsResponse>({
    statistics: {
      uniqueProducts: 0,
      uniqueLabs: 0,
      uniqueCategories: 0,
      totalSales: 0
    },
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  
  useEffect(() => {
    async function fetchGlobalStatistics() {
      // Vérifier que les dates sont disponibles
      if (!startDate || !endDate) {
        return;
      }
      
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Préparer les paramètres de la requête
        const params = new URLSearchParams({
          startDate,
          endDate
        });
        
        // Si on a une sélection spécifique, on l'ajoute aux paramètres
        if (selectedPharmacyIds.length > 0) {
          selectedPharmacyIds.forEach(id => {
            params.append('pharmacyIds', id);
          });
        }
        
        // Effectuer la requête
        const response = await fetch(`/api/statistics/global?${params}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des statistiques');
        }
        
        const result = await response.json();
        
        setData({
          statistics: result.statistics,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur dans useGlobalStatistics:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }));
      }
    }
    
    fetchGlobalStatistics();
  }, [startDate, endDate, selectedPharmacyIds]);
  
  return data;
}