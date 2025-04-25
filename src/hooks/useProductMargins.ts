// src/hooks/useProductMargins.ts
import { useState, useEffect } from 'react';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useProductFilter } from '@/contexts/ProductFilterContext';

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

export function useProductMarginsFiltered(): ProductMarginsData {
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
  const { selectedCodes, isFilterActive } = useProductFilter();
  const { startDate, endDate } = useDateRange();
  
  useEffect(() => {
    async function fetchProductMargins() {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Si aucun produit n'est sélectionné alors que le filtre est actif, on retourne des tableaux vides
        if (isFilterActive && selectedCodes.length === 0) {
          setData(prev => ({
            ...prev,
            isLoading: false
          }));
          return;
        }
        
        // Vérification que les dates sont présentes
        if (!startDate || !endDate) {
          setData(prev => ({
            ...prev,
            isLoading: false,
            error: "Dates de période manquantes"
          }));
          return;
        }
        
        // Utiliser POST pour envoyer les données dans le corps
        const response = await fetch('/api/products/margins', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pharmacyIds: selectedPharmacyIds.length > 0 ? selectedPharmacyIds : [],
            code13refs: isFilterActive ? selectedCodes : [],
            startDate: startDate,
            endDate: endDate,
            onlySoldProducts: true // Ne retourner que les produits vendus sur la période
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
        console.error('Erreur dans useProductMarginsFiltered:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }));
      }
    }
    
    fetchProductMargins();
  }, [selectedPharmacyIds, selectedCodes, isFilterActive, startDate, endDate]);
  
  return data;
}