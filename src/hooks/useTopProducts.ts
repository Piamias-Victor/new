// src/hooks/useTopProducts.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

export type SortByType = 'revenue' | 'quantity';

export interface TopProduct {
  product_id: string;
  product_name: string;
  display_name: string;
  category: string;
  brand_lab: string;
  tva_rate: number;
  code_13_ref: string;
  current_stock: number;
  total_quantity: number;
  total_revenue: number;
  total_margin: number;
  margin_percentage: number;
}

interface TopProductsData {
  byRevenue: TopProduct[];
  byQuantity: TopProduct[];
  byMargin: TopProduct[];
  isLoading: boolean;
  error: string | null;
}

export function useTopProducts(limit: number = 10): TopProductsData {
  const [data, setData] = useState<TopProductsData>({
    byRevenue: [],
    byQuantity: [],
    byMargin: [],
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  
  useEffect(() => {
    async function fetchTopProducts() {
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
          limit: limit.toString()
        });
        
        // Si on a une sélection spécifique, on l'ajoute aux paramètres
        if (selectedPharmacyIds.length > 0) {
          selectedPharmacyIds.forEach(id => {
            params.append('pharmacyIds', id);
          });
        }
        
        // Effectuer la requête
        const response = await fetch(`/api/products/top?${params}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des données');
        }
        
        const result = await response.json();
        
        // S'assurer que les tableaux existent et ne sont pas null
        setData({
          byRevenue: Array.isArray(result.byRevenue) ? result.byRevenue : [],
          byQuantity: Array.isArray(result.byQuantity) ? result.byQuantity : [],
          byMargin: Array.isArray(result.byMargin) ? result.byMargin : [],
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur dans useTopProducts:', error);
        setData({
          byRevenue: [],
          byQuantity: [],
          byMargin: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
    
    fetchTopProducts();
  }, [startDate, endDate, selectedPharmacyIds, limit]);
  
  return data;
}