// src/hooks/useRevenue.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

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
      revenue: { percentage: number; isPositive: boolean };
      margin: { percentage: number; isPositive: boolean };
      quantity: { percentage: number; isPositive: boolean };
      marginPercentage: { points: number; isPositive: boolean };
      uniqueReferences: { percentage: number; isPositive: boolean };
    },
    actualDateRange?: { min: string; max: string; days: number };
  };
  isComparisonEnabled: boolean;
  actualDateRange?: { min: string; max: string; days: number };
}

export function useRevenue() {
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
        revenue: { percentage: 0, isPositive: true },
        margin: { percentage: 0, isPositive: true },
        quantity: { percentage: 0, isPositive: true },
        marginPercentage: { points: 0, isPositive: true },
        uniqueReferences: { percentage: 0, isPositive: true }
      }
    },
    isComparisonEnabled: true
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { startDate, endDate, comparisonStartDate, comparisonEndDate, isComparisonEnabled } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  
  useEffect(() => {
    async function fetchData() {
      if (!startDate || !endDate) return;
      
      setIsLoading(true);
      setError(null);
      
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
            pharmacyIds: selectedPharmacyIds
          }),
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données de vente');
        }// src/hooks/useRevenue.ts (continuation)
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
          comparison: {
            totalRevenue: jsonData.comparison.revenue,
            totalMargin: jsonData.comparison.margin,
            totalQuantity: jsonData.comparison.quantity,
            marginPercentage: jsonData.comparison.marginPercentage,
            uniqueReferences: jsonData.comparison.uniqueReferences,
            evolution: {
              revenue: { 
                percentage: jsonData.evolution.revenue.percentage,
                isPositive: jsonData.evolution.revenue.percentage >= 0
              },
              margin: { 
                percentage: jsonData.evolution.margin.percentage,
                isPositive: jsonData.evolution.margin.percentage >= 0
              },
              quantity: { 
                percentage: jsonData.evolution.quantity.percentage,
                isPositive: jsonData.evolution.quantity.percentage >= 0
              },
              marginPercentage: { 
                points: jsonData.evolution.marginPercentage.points,
                isPositive: jsonData.evolution.marginPercentage.points >= 0
              },
              uniqueReferences: { 
                percentage: jsonData.evolution.uniqueReferences.percentage,
                isPositive: jsonData.evolution.uniqueReferences.percentage >= 0
              }
            },
            actualDateRange: {
              min: startDate,
              max: endDate,
              days: daysInPeriod
            }
          },
          isComparisonEnabled,
          actualDateRange: {
            min: startDate,
            max: endDate,
            days: daysInPeriod
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
  }, [startDate, endDate, comparisonStartDate, comparisonEndDate, selectedPharmacyIds, isComparisonEnabled]);
  
  return { ...data, isLoading, error };
}