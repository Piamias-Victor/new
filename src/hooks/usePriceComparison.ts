// src/hooks/usePriceComparison.ts
import { useState, useEffect } from 'react';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { useDateRange } from '@/contexts/DateRangeContext';

export interface PriceComparisonProductData {
  id: string;
  display_name: string;
  code_13_ref: string;
  brand_lab?: string;
  category?: string;
  price: number;
  avg_price: number;
  min_price: number;
  max_price: number;
  price_difference_percentage: number;
}

interface PriceComparisonData {
  veryLowPrice: PriceComparisonProductData[];
  lowPrice: PriceComparisonProductData[];
  averagePrice: PriceComparisonProductData[];
  highPrice: PriceComparisonProductData[];
  veryHighPrice: PriceComparisonProductData[];
  isLoading: boolean;
  error: string | null;
}

export function usePriceComparison(): PriceComparisonData {
  const [data, setData] = useState<PriceComparisonData>({
    veryLowPrice: [],
    lowPrice: [],
    averagePrice: [],
    highPrice: [],
    veryHighPrice: [],
    isLoading: true,
    error: null
  });
  
  const { selectedPharmacyIds } = usePharmacySelection();
  const { selectedCodes, isFilterActive } = useProductFilter();
    const { startDate, endDate, comparisonStartDate, comparisonEndDate, isComparisonEnabled } = useDateRange();
  
  
  useEffect(() => {
    async function fetchPriceComparison() {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Pas besoin de faire de requête si aucun produit n'est sélectionné
        if (isFilterActive && selectedCodes.length === 0) {
          setData(prev => ({
            ...prev,
            isLoading: false
          }));
          return;
        }
        
        const response = await fetch('/api/products/price-comparison', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pharmacyIds: selectedPharmacyIds.length > 0 ? selectedPharmacyIds : [],
            code13refs: isFilterActive ? selectedCodes : []
          }),
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des données');
        }
        
        const result = await response.json();
        
        setData({
          veryLowPrice: result.veryLowPrice || [],
          lowPrice: result.lowPrice || [],
          averagePrice: result.averagePrice || [],
          highPrice: result.highPrice || [],
          veryHighPrice: result.veryHighPrice || [],
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur dans usePriceComparison:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }));
      }
    }
    
    fetchPriceComparison();
  }, [selectedPharmacyIds, selectedCodes, isFilterActive, startDate, endDate, comparisonStartDate, comparisonEndDate, isComparisonEnabled]);
  
  return data;
}