// src/hooks/useSellInStockoutsData.ts
import { useState, useEffect } from 'react';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useDateRange } from '@/contexts/DateRangeContext';

interface SellInStockoutsData {
  sellIn: {
    totalPurchaseAmount: number;
    totalPurchaseQuantity: number;
    totalOrders: number;
  };
  stockouts: {
    totalStockoutsValue: number;
    totalStockoutsQuantity: number;
  };
  isLoading: boolean;
  error: string | null;
}

export function useSellInStockoutsData(): SellInStockoutsData {
  const [data, setData] = useState<SellInStockoutsData>({
    sellIn: {
      totalPurchaseAmount: 0,
      totalPurchaseQuantity: 0,
      totalOrders: 0
    },
    stockouts: {
      totalStockoutsValue: 0,
      totalStockoutsQuantity: 0
    },
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  
  useEffect(() => {
    async function fetchData() {
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
        const response = await fetch(`/api/statistics/sell-in-stockouts?${params}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des données');
        }
        
        const result = await response.json();
        
        setData({
          sellIn: result.sellIn,
          stockouts: result.stockouts,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur dans useSellInStockoutsData:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }));
      }
    }
    
    fetchData();
  }, [startDate, endDate, selectedPharmacyIds]);
  
  return data;
}