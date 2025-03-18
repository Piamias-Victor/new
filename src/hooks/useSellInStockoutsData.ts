// src/hooks/useSellInStockoutsData.ts
import { useState, useEffect } from 'react';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useDateRange } from '@/contexts/DateRangeContext';

// Fonction utilitaire pour convertir de manière sécurisée en nombre
function safeNumber(value: any, defaultValue: number = 0): number {
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

interface SellInStockoutsData {
  sellOut: {
    totalSellOut: number;
    totalMargin: number;
    referencesVendues: number;
    marginPercentage: number;
  };
  sellIn: {
    totalPurchaseAmount: number;
    totalPurchaseQuantity: number;
    totalOrders: number;
  };
  stockouts: {
    totalStockoutsValue: number;
    totalStockoutsQuantity: number;
  };
  stock: {
    totalStockValue: number;
  };
  isLoading: boolean;
  error: string | null;
}

export function useSellInStockoutsData(): SellInStockoutsData {
  const [data, setData] = useState<SellInStockoutsData>({
    sellOut: {
      totalSellOut: 0,
      totalMargin: 0,
      referencesVendues: 0,
      marginPercentage: 0
    },
    sellIn: {
      totalPurchaseAmount: 0,
      totalPurchaseQuantity: 0,
      totalOrders: 0
    },
    stockouts: {
      totalStockoutsValue: 0,
      totalStockoutsQuantity: 0
    },
    stock: {
      totalStockValue: 0
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
        const response = await fetch(`/api/sell-in-stockouts?${params}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des données');
        }
        
        const result = await response.json();
        
        // Convertir de manière sécurisée les valeurs numériques
        setData({
          sellOut: {
            totalSellOut: safeNumber(result.sellOut?.totalSellOut),
            totalMargin: safeNumber(result.sellOut?.totalMargin),
            referencesVendues: safeNumber(result.sellOut?.referencesVendues),
            marginPercentage: safeNumber(result.sellOut?.marginPercentage)
          },
          sellIn: {
            totalPurchaseAmount: safeNumber(result.sellIn?.totalPurchaseAmount),
            totalPurchaseQuantity: safeNumber(result.sellIn?.totalPurchaseQuantity),
            totalOrders: safeNumber(result.sellIn?.totalOrders)
          },
          stockouts: {
            totalStockoutsValue: safeNumber(result.stockouts?.totalStockoutsValue),
            totalStockoutsQuantity: safeNumber(result.stockouts?.totalStockoutsQuantity)
          },
          stock: {
            totalStockValue: safeNumber(result.stock?.totalStockValue)
          },
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