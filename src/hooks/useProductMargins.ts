// src/hooks/useProductMargins.ts
import { useState, useEffect } from 'react';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useDateRange } from '@/contexts/DateRangeContext';

export interface MarginProductData {
  id: string;
  product_name: string;
  global_name: string;
  display_name: string;
  category: string;
  brand_lab: string;
  code_13_ref: string;
  current_stock: number;
  price_with_tax: number;
  weighted_average_price: number;
  margin_percentage: number;
  margin_amount: number;
  total_sales: number;
}

interface ProductMarginsData {
  negativeMargin: MarginProductData[];
  lowMargin: MarginProductData[];
  mediumMargin: MarginProductData[];
  goodMargin: MarginProductData[];
  excellentMargin: MarginProductData[];
  isLoading: boolean;
  error: string | null;
}

export function useProductMargins(): ProductMarginsData {
  const [data, setData] = useState<ProductMarginsData>({
    negativeMargin: [],
    lowMargin: [],
    mediumMargin: [],
    goodMargin: [],
    excellentMargin: [],
    isLoading: true,
    error: null
  });
  
  const { selectedPharmacyIds } = usePharmacySelection();
  const { startDate, endDate } = useDateRange();
  
  useEffect(() => {
    async function fetchProductMargins() {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Utiliser POST au lieu de GET pour envoyer les données dans le corps
        const response = await fetch('/api/products/margins', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pharmacyIds: selectedPharmacyIds,
            startDate, // Ajouter la période
            endDate,   // Ajouter la période
            onlySoldProducts: true // Nouveau paramètre pour indiquer qu'on veut uniquement les produits vendus
          }),
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des données');
        }
        
        const result = await response.json();
        
        setData({
          negativeMargin: result.negativeMargin || [],
          lowMargin: result.lowMargin || [],
          mediumMargin: result.mediumMargin || [],
          goodMargin: result.goodMargin || [],
          excellentMargin: result.excellentMargin || [],
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur dans useProductMargins:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }));
      }
    }
    
    fetchProductMargins();
  }, [selectedPharmacyIds, startDate, endDate]);
  
  return data;
}