// src/hooks/useInventoryValuationWithFilter.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';

interface InventoryData {
  totalStockValueHT: number;
  totalUnits: number;
  averagePrice: number;
  stockDays: number;
  comparison: {
    totalStockValueHT: number;
    totalUnits: number;
    averagePrice: number;
    evolution: {
      stockValue: { percentage: number; isPositive: boolean; displayValue: string };
      units: { percentage: number; isPositive: boolean; displayValue: string };
      averagePrice: { percentage: number; isPositive: boolean; displayValue: string };
    }
  };
  isLoading: boolean;
  error: string | null;
}

export function useInventoryValuationWithFilter() {
  const [data, setData] = useState<InventoryData>({
    totalStockValueHT: 0,
    totalUnits: 0,
    averagePrice: 0,
    stockDays: 0,
    comparison: {
      totalStockValueHT: 0,
      totalUnits: 0,
      averagePrice: 0,
      evolution: {
        stockValue: { percentage: 0, isPositive: false, displayValue: '+0.0%' },
        units: { percentage: 0, isPositive: false, displayValue: '+0.0%' },
        averagePrice: { percentage: 0, isPositive: true, displayValue: '+0.0%' }
      }
    },
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate, comparisonStartDate, comparisonEndDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  const { selectedCodes, isFilterActive } = useProductFilter();
  
  useEffect(() => {
    async function fetchData() {
      if (!startDate || !endDate) return;
      
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const response = await fetch('/api/kpi/stock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate,
            endDate,
            comparisonStartDate: comparisonStartDate || startDate,
            comparisonEndDate: comparisonEndDate || endDate,
            pharmacyIds: selectedPharmacyIds,
            // Ajouter les codes EAN13 sélectionnés si le filtre est actif
            code13refs: isFilterActive ? selectedCodes : undefined
          }),
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données de stock');
        }
        
        const jsonData = await response.json();
        
        // Mettre à jour l'état avec les données reçues
        setData({
          totalStockValueHT: jsonData.current.stockValueHT,
          totalUnits: jsonData.current.stockUnits,
          averagePrice: jsonData.current.averagePrice,
          stockDays: jsonData.stockDaysInfo.stockDaysValue,
          comparison: {
            totalStockValueHT: jsonData.comparison.stockValueHT,
            totalUnits: jsonData.comparison.stockUnits,
            averagePrice: jsonData.comparison.averagePrice,
            evolution: jsonData.evolution
          },
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }));
      }
    }
    
    fetchData();
  }, [startDate, endDate, comparisonStartDate, comparisonEndDate, selectedPharmacyIds, selectedCodes, isFilterActive]);
  
  return data;
}