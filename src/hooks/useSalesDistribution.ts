// src/hooks/useSalesDistribution.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

export interface SalesDistributionItem {
  category: string;
  total_revenue: number;
  total_margin: number;
  margin_percentage: number;
  total_quantity: number;
  revenue_percentage: number;
}

interface SalesDistributionData {
  distributions: SalesDistributionItem[];
  totalRevenue: number;
  isLoading: boolean;
  error: string | null;
}

export function useSalesDistribution(): SalesDistributionData {
  const [data, setData] = useState<SalesDistributionData>({
    distributions: [],
    totalRevenue: 0,
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  
  useEffect(() => {
    async function fetchSalesDistribution() {
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
        const response = await fetch(`/api/sales/distribution?${params}`, {
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
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur dans useSalesDistribution:', error);
        setData({
          distributions: [],
          totalRevenue: 0,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
    
    fetchSalesDistribution();
  }, [startDate, endDate, selectedPharmacyIds]);
  
  return data;
}