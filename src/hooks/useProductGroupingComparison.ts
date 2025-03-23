// src/hooks/useProductGroupingComparison.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

export interface ProductGroupingData {
  price: {
    yourValue: number;
    average: number;
    maximum: number;
    minimum: number;
    percentage: number;
  };
  margin: {
    yourValue: number;
    average: number;
    maximum: number;
    minimum: number;
    percentage: number;
  };
  rotation: {
    yourValue: number;
    average: number;
    maximum: number;
    minimum: number;
    percentage: number;
  };
  stock: {
    yourValue: number;
    average: number;
    maximum: number;
    minimum: number;
    percentage: number;
  };
  sales: {
    yourValue: number;
    average: number;
    maximum: number;
    minimum: number;
    percentage: number;
  };
  isLoading: boolean;
  error: string | null;
}

export function useProductGroupingComparison(code13ref: string): ProductGroupingData {
  const [data, setData] = useState<ProductGroupingData>({
    price: { yourValue: 0, average: 0, maximum: 0, minimum: 0, percentage: 0 },
    margin: { yourValue: 0, average: 0, maximum: 0, minimum: 0, percentage: 0 },
    rotation: { yourValue: 0, average: 0, maximum: 0, minimum: 0, percentage: 0 },
    stock: { yourValue: 0, average: 0, maximum: 0, minimum: 0, percentage: 0 },
    sales: { yourValue: 0, average: 0, maximum: 0, minimum: 0, percentage: 0 },
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  
  useEffect(() => {
    async function fetchGroupingComparison() {
      if (!code13ref || !startDate || !endDate) {
        setData(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Construire les paramètres pour la requête
        const params = new URLSearchParams({
          startDate,
          endDate,
          code13ref
        });
        
        // Ajouter les IDs des pharmacies sélectionnées
        if (selectedPharmacyIds.length > 0) {
          selectedPharmacyIds.forEach(id => {
            params.append('pharmacyIds', id);
          });
        }
        
        // Effectuer la requête
        const response = await fetch(`/api/products/grouping-comparison?${params}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données de comparaison');
        }
        
        const result = await response.json();
        
        setData({
          ...result,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur dans useProductGroupingComparison:', error);
        
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur lors de la récupération des données de comparaison'
        }));
      }
    }
    
    fetchGroupingComparison();
  }, [code13ref, startDate, endDate, selectedPharmacyIds]);
  
  return data;
}