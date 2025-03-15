// src/hooks/useInventoryValuation.ts
import { useState, useEffect } from 'react';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useDateRange } from '@/contexts/DateRangeContext';

interface InventoryData {
  totalStockValueHT: number;
  totalUnits: number;
  date: string;
}

interface InventoryValuationData {
  totalStockValueHT: number;
  totalUnits: number;
  isLoading: boolean;
  error: string | null;
  comparison?: {
    totalStockValueHT: number;
    totalUnits: number;
    evolution: {
      stockValue: {
        absolute: number;
        percentage: number;
        isPositive: boolean;
      };
      units: {
        absolute: number;
        percentage: number;
        isPositive: boolean;
      };
    };
  };
}

export function useInventoryValuation(): InventoryValuationData {
  const [data, setData] = useState<InventoryValuationData>({
    totalStockValueHT: 0,
    totalUnits: 0,
    isLoading: true,
    error: null
  });
  
  const { selectedPharmacyIds } = usePharmacySelection();
  const { endDate, comparisonEndDate, isComparisonEnabled } = useDateRange();
  
  useEffect(() => {
    async function fetchInventoryValuation() {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Préparer les paramètres de base (date courante)
        const params = new URLSearchParams();
        if (endDate) {
          params.append('date', endDate);
        }
        
        // Ajouter les IDs des pharmacies
        if (selectedPharmacyIds.length > 0) {
          selectedPharmacyIds.forEach(id => {
            params.append('pharmacyIds', id);
          });
        }
        
        // Faire la requête API pour la période principale
        const response = await fetch(`/api/inventory/valuation?${params}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des données de stock');
        }
        
        const result = await response.json();
        
        // Préparation des données primaires
        const stockData: InventoryValuationData = {
          totalStockValueHT: result.totalStockValueHT,
          totalUnits: result.totalUnits,
          isLoading: false,
          error: null
        };
        
        // Si la comparaison est activée, récupérer les données de comparaison
        if (isComparisonEnabled && comparisonEndDate) {
          // Préparer les paramètres pour la comparaison
          const comparisonParams = new URLSearchParams();
          comparisonParams.append('date', comparisonEndDate);
          
          // Ajouter les mêmes IDs de pharmacies
          if (selectedPharmacyIds.length > 0) {
            selectedPharmacyIds.forEach(id => {
              comparisonParams.append('pharmacyIds', id);
            });
          }
          
          // Faire la requête API pour la période de comparaison
          const comparisonResponse = await fetch(`/api/inventory/valuation?${comparisonParams}`, {
            cache: 'no-store'
          });
          
          if (comparisonResponse.ok) {
            const comparisonResult = await comparisonResponse.json();
            
            // Calculer les évolutions
            const stockValueDiff = result.totalStockValueHT - comparisonResult.totalStockValueHT;
            const stockValuePerc = comparisonResult.totalStockValueHT !== 0 
              ? (stockValueDiff / comparisonResult.totalStockValueHT) * 100 
              : 0;
            
            const unitsDiff = result.totalUnits - comparisonResult.totalUnits;
            const unitsPerc = comparisonResult.totalUnits !== 0 
              ? (unitsDiff / comparisonResult.totalUnits) * 100 
              : 0;
            
            // Ajouter les données de comparaison
            stockData.comparison = {
              totalStockValueHT: comparisonResult.totalStockValueHT,
              totalUnits: comparisonResult.totalUnits,
              evolution: {
                stockValue: {
                  absolute: stockValueDiff,
                  percentage: stockValuePerc,
                  // Moins de stock est généralement considéré comme positif (moins d'immobilisation)
                  isPositive: stockValueDiff < 0
                },
                units: {
                  absolute: unitsDiff,
                  percentage: unitsPerc,
                  // Moins d'unités est généralement considéré comme positif
                  isPositive: unitsDiff < 0
                }
              }
            };
          }
        }
        
        setData(stockData);
      } catch (error) {
        console.error('Erreur dans useInventoryValuation:', error);
        setData({
          totalStockValueHT: 0,
          totalUnits: 0,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
    
    fetchInventoryValuation();
  }, [endDate, comparisonEndDate, selectedPharmacyIds, isComparisonEnabled]);
  
  return data;
}