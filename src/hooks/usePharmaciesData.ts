// src/hooks/usePharmaciesData.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useProductFilter } from '@/contexts/ProductFilterContext';

export interface PharmacyDetailData {
  id: string;
  name: string;
  area: string;
  sell_out_price_ttc: number;
  sell_in_price_ht: number;
  margin_percentage: number;
  margin_amount: number;
  stock_value_ht: number;
  stock_quantity: number;
  sales_quantity: number;
  previous_sales_quantity: number;
  sales_evolution_percentage: number;
  total_sell_out: number;
  total_sell_in: number;
  product_count: number;      // Nombre de références actives
  selection_weight: number;   // Poids de la sélection dans le CA global
}

export function usePharmaciesData() {
  const [pharmacies, setPharmacies] = useState<PharmacyDetailData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { startDate, endDate, comparisonStartDate, comparisonEndDate } = useDateRange();
  const { selectedCodes } = useProductFilter();
  
  useEffect(() => {
    async function fetchPharmaciesData() {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/products/pharmacies/details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate,
            endDate,
            comparisonStartDate,
            comparisonEndDate,
            code13refs: selectedCodes
          }),
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données pharmacies');
        }
        
        const data = await response.json();
        setPharmacies(data.pharmacies || []);
      } catch (err) {
        console.error('Erreur dans usePharmaciesData:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPharmaciesData();
  }, [startDate, endDate, comparisonStartDate, comparisonEndDate, selectedCodes]);
  
  return { pharmacies, isLoading, error };
}