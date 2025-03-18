// src/hooks/useProductMargins.ts
import { useState, useEffect } from 'react';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

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
  
  useEffect(() => {
    async function fetchProductMargins() {
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
        const response = await fetch(`/api/products/margins?${params}`, {
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
  }, [selectedPharmacyIds]);
  
  return data;
}