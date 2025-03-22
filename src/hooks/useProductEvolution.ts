// src/hooks/useProductEvolution.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';

// Définition des données de produit pour l'évolution
export interface EvolutionProductData {
  id: string;
  display_name: string;
  code_13_ref: string;
  category?: string;
  brand_lab?: string;
  current_stock: number;
  current_revenue: number;
  previous_revenue: number;
  evolution_percentage: number;
}

// Définition de la structure de données principale
interface ProductEvolutionData {
  strongDecrease: EvolutionProductData[];
  slightDecrease: EvolutionProductData[];
  stable: EvolutionProductData[];
  slightIncrease: EvolutionProductData[];
  strongIncrease: EvolutionProductData[];
  isLoading: boolean;
  error: string | null;
}

export function useProductEvolution(): ProductEvolutionData {
  const [data, setData] = useState<ProductEvolutionData>({
    strongDecrease: [],
    slightDecrease: [],
    stable: [],
    slightIncrease: [],
    strongIncrease: [],
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate, comparisonStartDate, comparisonEndDate, isComparisonEnabled } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  const { selectedCodes, isFilterActive } = useProductFilter();
  
  useEffect(() => {
    async function fetchProductEvolution() {
      // Vérifier que les dates et la comparaison sont disponibles
      if (!startDate || !endDate || !isComparisonEnabled || !comparisonStartDate || !comparisonEndDate) {
        setData(prev => ({ 
          ...prev, 
          isLoading: false,
          strongDecrease: [],
          slightDecrease: [],
          stable: [],
          slightIncrease: [],
          strongIncrease: []
        }));
        return;
      }
      
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Pas besoin de faire de requête si aucun produit n'est sélectionné
        if (isFilterActive && selectedCodes.length === 0) {
          setData({
            strongDecrease: [],
            slightDecrease: [],
            stable: [],
            slightIncrease: [],
            strongIncrease: [],
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
          response = await fetch('/api/products/evolution', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              startDate,
              endDate,
              comparisonStartDate,
              comparisonEndDate,
              pharmacyIds: selectedPharmacyIds.length > 0 ? selectedPharmacyIds : [],
              code13refs: isFilterActive ? selectedCodes : []
            }),
            cache: 'no-store'
          });
        } else {
          // Préparer les paramètres pour GET
          const params = new URLSearchParams({
            startDate,
            endDate,
            comparisonStartDate,
            comparisonEndDate
          });
          
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
          response = await fetch(`/api/products/evolution?${params}`, {
            cache: 'no-store'
          });
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des données');
        }
        
        const result = await response.json();
        
        setData({
          strongDecrease: result.strongDecrease || [],
          slightDecrease: result.slightDecrease || [],
          stable: result.stable || [],
          slightIncrease: result.slightIncrease || [],
          strongIncrease: result.strongIncrease || [],
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur dans useProductEvolution:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }));
      }
    }
    
    fetchProductEvolution();
  }, [
    startDate, 
    endDate, 
    comparisonStartDate, 
    comparisonEndDate, 
    selectedPharmacyIds, 
    selectedCodes, 
    isFilterActive, 
    isComparisonEnabled
  ]);
  
  return data;
}