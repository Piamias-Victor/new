// src/hooks/useInventoryValuation.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

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
}

export function useInventoryValuation() {
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
    }
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { startDate, endDate, comparisonStartDate, comparisonEndDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  
  useEffect(() => {
    async function fetchData() {
      if (!startDate || !endDate) return;
      
      setIsLoading(true);
      setError(null);
      
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
            pharmacyIds: selectedPharmacyIds
          }),
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données de stock');
        }
        
        const jsonData = await response.json();
        
        // Préparation des affichages avec signes
        // Pour stock et unités, une DIMINUTION est positive (en vert)
        const stockValueDisplayValue = `${jsonData.evolution.stockValue.percentage >= 0 ? '+' : ''}${jsonData.evolution.stockValue.percentage.toFixed(1)}%`;
        const unitsDisplayValue = `${jsonData.evolution.units.percentage >= 0 ? '+' : ''}${jsonData.evolution.units.percentage.toFixed(1)}%`;
        
        // Pour prix moyen, une AUGMENTATION est positive
        const avgPriceDisplayValue = `${jsonData.evolution.averagePrice.percentage >= 0 ? '+' : ''}${jsonData.evolution.averagePrice.percentage.toFixed(1)}%`;
        
        setData({
          totalStockValueHT: jsonData.current.stockValueHT,
          totalUnits: jsonData.current.stockUnits,
          averagePrice: jsonData.current.averagePrice,
          stockDays: jsonData.stockDaysInfo.stockDaysValue,
          comparison: {
            totalStockValueHT: jsonData.comparison.stockValueHT,
            totalUnits: jsonData.comparison.stockUnits,
            averagePrice: jsonData.comparison.averagePrice,
            evolution: {
              // Pour ces métriques, une DIMINUTION est positive (en vert)
              stockValue: { 
                percentage: jsonData.evolution.stockValue.percentage,
                isPositive: jsonData.evolution.stockValue.percentage < 0,
                displayValue: stockValueDisplayValue
              },
              units: { 
                percentage: jsonData.evolution.units.percentage,
                isPositive: jsonData.evolution.units.percentage < 0,
                displayValue: unitsDisplayValue
              },
              averagePrice: { 
                percentage: jsonData.evolution.averagePrice.percentage,
                isPositive: jsonData.evolution.averagePrice.percentage >= 0,
                displayValue: avgPriceDisplayValue
              }
            }
          }
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setError(error instanceof Error ? error.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [startDate, endDate, comparisonStartDate, comparisonEndDate, selectedPharmacyIds]);
  
  return { ...data, isLoading, error };
}