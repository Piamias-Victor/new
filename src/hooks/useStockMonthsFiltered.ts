// src/hooks/useStockMonthsFiltered.ts
import { useState, useEffect } from 'react';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { StockProductData } from '@/hooks/useStockMonths';
import { useDateRange } from '@/contexts/DateRangeContext';

interface StockMonthsData {
  criticalLow: StockProductData[];
  toWatch: StockProductData[];
  optimal: StockProductData[];
  overStock: StockProductData[];
  criticalHigh: StockProductData[];
  isLoading: boolean;
  error: string | null;
}

export function useStockMonthsFiltered(): StockMonthsData {
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
  const { selectedCodes, isFilterActive } = useProductFilter();
  const { startDate, endDate, comparisonStartDate, comparisonEndDate, isComparisonEnabled } = useDateRange();
  
  
  useEffect(() => {
    async function fetchStockMonths() {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Pas besoin de faire de requête si aucun produit n'est sélectionné
        if (isFilterActive && selectedCodes.length === 0) {
          setData({
            criticalLow: [],
            toWatch: [],
            optimal: [],
            overStock: [],
            criticalHigh: [],
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
          response = await fetch('/api/inventory/stock-months', {
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
          response = await fetch(`/api/inventory/stock-months?${params}`, {
            cache: 'no-store'
          });
        }
        
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
        console.error('Erreur dans useStockMonthsFiltered:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }));
      }
    }
    
    fetchStockMonths();
  }, [selectedPharmacyIds, selectedCodes, isFilterActive, startDate, endDate, comparisonStartDate, comparisonEndDate, isComparisonEnabled]);
  
  return data;
}