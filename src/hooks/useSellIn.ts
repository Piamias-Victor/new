// src/hooks/useSellIn.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

interface SellInData {
  totalPurchaseAmount: number;
  totalPurchaseQuantity: number;
  totalStockBreakAmount: number;
  totalStockBreakQuantity: number;
  stockBreakRate: number;
  totalOrders: number;
  comparison: {
    totalPurchaseAmount: number;
    totalPurchaseQuantity: number;
    totalStockBreakAmount: number;
    totalStockBreakQuantity: number;
    stockBreakRate: number;
    totalOrders: number;
    evolution: {
      purchaseAmount: { percentage: number; isPositive: boolean };
      purchaseQuantity: { percentage: number; isPositive: boolean };
      stockBreakAmount: { percentage: number; isPositive: boolean };
      stockBreakQuantity: { percentage: number; isPositive: boolean };
      stockBreakRate: { points: number; isPositive: boolean };
      orders: { percentage: number; isPositive: boolean };
    }
  };
}

export function useSellIn() {
  const [data, setData] = useState<SellInData>({
    totalPurchaseAmount: 0,
    totalPurchaseQuantity: 0,
    totalStockBreakAmount: 0,
    totalStockBreakQuantity: 0,
    stockBreakRate: 0,
    totalOrders: 0,
    comparison: {
      totalPurchaseAmount: 0,
      totalPurchaseQuantity: 0,
      totalStockBreakAmount: 0,
      totalStockBreakQuantity: 0,
      stockBreakRate: 0,
      totalOrders: 0,
      evolution: {
        purchaseAmount: { percentage: 0, isPositive: true },
        purchaseQuantity: { percentage: 0, isPositive: true },
        stockBreakAmount: { percentage: 0, isPositive: true },
        stockBreakQuantity: { percentage: 0, isPositive: true },
        stockBreakRate: { points: 0, isPositive: true },
        orders: { percentage: 0, isPositive: true }
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
        const response = await fetch('/api/kpi/sell-in', {
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
          throw new Error('Erreur lors de la récupération des données d\'achat');
        }
        
        const jsonData = await response.json();
        
        setData({
          totalPurchaseAmount: jsonData.current.purchaseAmount,
          totalPurchaseQuantity: jsonData.current.purchaseQuantity,
          totalStockBreakAmount: jsonData.current.stockBreakAmount,
          totalStockBreakQuantity: jsonData.current.stockBreakQuantity,
          stockBreakRate: jsonData.current.stockBreakRate,
          totalOrders: jsonData.current.ordersCount,
          comparison: {
            totalPurchaseAmount: jsonData.comparison.purchaseAmount,
            totalPurchaseQuantity: jsonData.comparison.purchaseQuantity,
            totalStockBreakAmount: jsonData.comparison.stockBreakAmount,
            totalStockBreakQuantity: jsonData.comparison.stockBreakQuantity,
            stockBreakRate: jsonData.comparison.stockBreakRate,
            totalOrders: jsonData.comparison.ordersCount,
            evolution: {
              purchaseAmount: { 
                percentage: jsonData.evolution.purchaseAmount.percentage,
                isPositive: jsonData.evolution.purchaseAmount.isPositive
              },
              purchaseQuantity: { 
                percentage: jsonData.evolution.purchaseQuantity.percentage,
                isPositive: jsonData.evolution.purchaseQuantity.isPositive
              },
              stockBreakAmount: { 
                percentage: jsonData.evolution.stockBreakAmount.percentage,
                isPositive: jsonData.evolution.stockBreakAmount.isPositive
              },
              stockBreakQuantity: { 
                percentage: jsonData.evolution.stockBreakQuantity.percentage,
                isPositive: jsonData.evolution.stockBreakQuantity.isPositive
              },
              stockBreakRate: { 
                points: jsonData.evolution.stockBreakRate.points,
                isPositive: jsonData.evolution.stockBreakRate.isPositive
              },
              orders: { 
                percentage: jsonData.evolution.orders.percentage,
                isPositive: jsonData.evolution.orders.isPositive
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