// src/hooks/useStockMonths.ts
import { useState, useEffect } from 'react';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

export interface StockProductData {
  id: string;
  product_name: string;
  global_name: string;
  display_name: string;
  category: string;
  brand_lab: string;
  code_13_ref: string;
  current_stock: number;
  avg_monthly_sales: number;
  stock_months: number;
}

interface StockMonthsData {
  criticalLow: StockProductData[];
  toWatch: StockProductData[];
  optimal: StockProductData[];
  overStock: StockProductData[];
  criticalHigh: StockProductData[];
  isLoading: boolean;
  error: string | null;
}

export function useStockMonths(): StockMonthsData {
  const [data, setData] = useState<StockMonthsData>({
    criticalLow: [],
    toWatch: [],
    optimal: [],
    overStock: [],
    criticalHigh: [],
    isLoading: true,
    error: null
  });
  
  const { selectedPharmacyIds } = usePharmacySelection();
  
  useEffect(() => {
    async function fetchStockMonths() {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Préparer les paramètres de la requête
        const params = new URLSearchParams();
        
        // Si on a une sélection spécifique, on l'ajoute aux paramètres
        if (selectedPharmacyIds.length > 0) {
          selectedPharmacyIds.forEach(id => {
            params.append('pharmacyIds', id);
          });
        }
        
        // Effectuer la requête
        const response = await fetch(`/api/inventory/stock-months?${params}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des données');
        }
        
        const result = await response.json();
        
        setData({
          criticalLow: result.criticalLow || [],
          toWatch: result.toWatch || [],
          optimal: result.optimal || [],
          overStock: result.overStock || [],
          criticalHigh: result.criticalHigh || [],
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur dans useStockMonths:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }));
      }
    }
    
    fetchStockMonths();
  }, [selectedPharmacyIds]);
  
  return data;
}