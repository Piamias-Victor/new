// src/hooks/useSelectedProductsData.ts
import { useState, useEffect } from 'react';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useDateRange } from '@/contexts/DateRangeContext';

export interface ProductDetailData {
  id: string;
  display_name: string;
  code_13_ref: string;
  sell_out_price_ttc: number;
  brand_lab: string; // Ajout du nom du laboratoire
  sell_in_price_ht: number;
  margin_percentage: number;
  margin_amount: number;
  stock_value_ht: number;
  stock_quantity: number;
  sales_quantity: number;
  previous_sales_quantity: number;
  sales_evolution_percentage: number;
  // Totaux de vente pour la période
  total_sell_out: number;
  total_sell_in: number;
}

export function useSelectedProductsData() {
  const [products, setProducts] = useState<ProductDetailData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { selectedCodes, isFilterActive } = useProductFilter();
  const { selectedPharmacyIds } = usePharmacySelection();
  const { startDate, endDate, comparisonStartDate, comparisonEndDate } = useDateRange();
  
  useEffect(() => {
    async function fetchSelectedProductsData() {
      // Si aucun produit n'est sélectionné, ne rien charger
      if (!isFilterActive || selectedCodes.length === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/products/details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code13refs: selectedCodes,
            pharmacyIds: selectedPharmacyIds,
            startDate,
            endDate,
            comparisonStartDate,
            comparisonEndDate
          }),
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données produits');
        }
        
        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error('Erreur dans useSelectedProductsData:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSelectedProductsData();
  }, [selectedCodes, selectedPharmacyIds, isFilterActive, startDate, endDate, comparisonStartDate, comparisonEndDate]);
  
  return { products, isLoading, error };
}