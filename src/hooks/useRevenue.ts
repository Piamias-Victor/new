// src/hooks/useRevenueWithFilter.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';

interface RevenueData {
  totalRevenue: number;
  totalMargin: number;
  totalQuantity: number;
  marginPercentage: number;
  uniqueReferences: number;
  comparison: {
    totalRevenue: number;
    totalMargin: number;
    totalQuantity: number;
    marginPercentage: number;
    uniqueReferences: number;
    evolution: {
      revenue: { percentage: number; isPositive: boolean; displayValue: string };
      margin: { percentage: number; isPositive: boolean; displayValue: string };
      quantity: { percentage: number; isPositive: boolean; displayValue: string };
      marginPercentage: { points: number; isPositive: boolean; displayValue: string };
      uniqueReferences: { percentage: number; isPositive: boolean; displayValue: string };
    },
    actualDateRange?: { min: string; max: string; days: number };
  };
  isComparisonEnabled: boolean;
  actualDateRange?: { min: string; max: string; days: number };
  isLoading: boolean;
  error: string | null;
}

export function useRevenueWithFilter() {
  const [data, setData] = useState<RevenueData>({
    totalRevenue: 0,
    totalMargin: 0,
    totalQuantity: 0,
    marginPercentage: 0,
    uniqueReferences: 0,
    comparison: {
      totalRevenue: 0,
      totalMargin: 0,
      totalQuantity: 0,
      marginPercentage: 0,
      uniqueReferences: 0,
      evolution: {
        revenue: { percentage: 0, isPositive: true, displayValue: '+0.0%' },
        margin: { percentage: 0, isPositive: true, displayValue: '+0.0%' },
        quantity: { percentage: 0, isPositive: true, displayValue: '+0.0%' },
        marginPercentage: { points: 0, isPositive: true, displayValue: '+0.0 pts' },
        uniqueReferences: { percentage: 0, isPositive: true, displayValue: '+0.0%' }
      }
    },
    isComparisonEnabled: true,
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate, comparisonStartDate, comparisonEndDate, isComparisonEnabled } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  const { selectedCodes, isFilterActive } = useProductFilter();
  
  useEffect(() => {
    async function fetchData() {
      if (!startDate || !endDate) return;
      
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const response = await fetch('/api/kpi/sell-out', {
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
            // Ajouter cette ligne pour envoyer les codes EAN13 sélectionnés
            code13refs: isFilterActive ? selectedCodes : undefined
          }),
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données de vente');
        }
        
        const jsonData = await response.json();
        
        // Calculer le nombre de jours dans la période
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const daysInPeriod = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        setData({
          totalRevenue: jsonData.current.revenue,
          totalMargin: jsonData.current.margin,
          totalQuantity: jsonData.current.quantity,
          marginPercentage: jsonData.current.marginPercentage,
          uniqueReferences: jsonData.current.uniqueReferences,
          comparison: jsonData.comparison,
          isComparisonEnabled,
          actualDateRange: {
            min: jsonData.actualDateRange?.min || startDate,
            max: jsonData.actualDateRange?.max || endDate,
            days: jsonData.actualDateRange?.days || daysInPeriod
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
  }, [startDate, endDate, comparisonStartDate, comparisonEndDate, selectedPharmacyIds, isComparisonEnabled, selectedCodes, isFilterActive]);
  
  return data;
}