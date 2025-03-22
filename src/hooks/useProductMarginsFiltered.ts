// src/hooks/useProductMarginsFiltered.ts
import { useState, useEffect } from 'react';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { MarginProductData } from '@/hooks/useProductMargins';

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
  
  useEffect(() => {
    async function fetchProductMargins() {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Pas besoin de faire de requête si aucun produit n'est sélectionné
        if (isFilterActive && selectedCodes.length === 0) {
          setData({
            negativeMargin: [],
            lowMargin: [],
            mediumMargin: [],
            goodMargin: [],
            excellentMargin: [],
            isLoading: false,
            error: null
          });
          return;
        }
        
        // Détermine si on doit utiliser POST ou GET en fonction du nombre de codes
        const shouldUsePost = isFilterActive && selectedCodes.length > 20;
        let response;
        
        if (shouldUsePost) {
          // Utiliser POST pour les grandes listes de codes
          response = await fetch('/api/products/margins', {
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
        } else {
          // Préparer les paramètres pour GET
          const params = new URLSearchParams();
          
          // Si on a une sélection spécifique de pharmacies
          if (selectedPharmacyIds.length > 0) {
            selectedPharmacyIds.forEach(id => {
              params.append('pharmacyIds', id);
            });
          }
          
          // Si on a une sélection de codes EAN13
          if (isFilterActive && selectedCodes.length > 0) {
            selectedCodes.forEach(code => {
              params.append('code13refs', code);
            });
          }
          
          // Effectuer la requête GET
          response = await fetch(`/api/products/margins?${params}`, {
            cache: 'no-store'
          });
        }
        
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
  }, [selectedPharmacyIds, selectedCodes, isFilterActive]);
  
  return data;
}