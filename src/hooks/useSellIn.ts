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
      purchaseAmount: { percentage: number; isPositive: boolean; displayValue: string };
      purchaseQuantity: { percentage: number; isPositive: boolean; displayValue: string };
      stockBreakAmount: { percentage: number; isPositive: boolean; displayValue: string };
      stockBreakQuantity: { percentage: number; isPositive: boolean; displayValue: string };
      stockBreakRate: { points: number; isPositive: boolean; displayValue: string };
      orders: { percentage: number; isPositive: boolean; displayValue: string };
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
        purchaseAmount: { percentage: 0, isPositive: true, displayValue: '+0.0%' },
        purchaseQuantity: { percentage: 0, isPositive: true, displayValue: '+0.0%' },
        stockBreakAmount: { percentage: 0, isPositive: false, displayValue: '+0.0%' },
        stockBreakQuantity: { percentage: 0, isPositive: false, displayValue: '+0.0%' },
        stockBreakRate: { points: 0, isPositive: false, displayValue: '+0.0%' },
        orders: { percentage: 0, isPositive: false, displayValue: '+0.0%' }
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
        
        // Pour ruptures et commandes: une diminution est positive (vert)
        // Préparation des strings d'affichage avec signes +/-
        const purchaseAmountDisplayValue = `${jsonData.evolution.purchaseAmount.percentage >= 0 ? '+' : ''}${jsonData.evolution.purchaseAmount.percentage.toFixed(1)}%`;
        const purchaseQuantityDisplayValue = `${jsonData.evolution.purchaseQuantity.percentage >= 0 ? '+' : ''}${jsonData.evolution.purchaseQuantity.percentage.toFixed(1)}%`;
        
        // Pour ces métriques une baisse est positive (en vert)
        const stockBreakAmountDisplayValue = `${jsonData.evolution.stockBreakAmount.percentage >= 0 ? '+' : ''}${jsonData.evolution.stockBreakAmount.percentage.toFixed(1)}%`;
        const stockBreakQuantityDisplayValue = `${jsonData.evolution.stockBreakQuantity.percentage >= 0 ? '+' : ''}${jsonData.evolution.stockBreakQuantity.percentage.toFixed(1)}%`;
        const stockBreakRateDisplayValue = `${jsonData.evolution.stockBreakRate.points >= 0 ? '+' : ''}${jsonData.evolution.stockBreakRate.points.toFixed(1)}%`;
        const ordersDisplayValue = `${jsonData.evolution.orders.percentage >= 0 ? '+' : ''}${jsonData.evolution.orders.percentage.toFixed(1)}%`;
        
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
                isPositive: jsonData.evolution.purchaseAmount.percentage >= 0,
                displayValue: purchaseAmountDisplayValue
              },
              purchaseQuantity: { 
                percentage: jsonData.evolution.purchaseQuantity.percentage,
                isPositive: jsonData.evolution.purchaseQuantity.percentage >= 0,
                displayValue: purchaseQuantityDisplayValue
              },
              // Pour ces métriques, une DIMINUTION est positive (en vert)
              stockBreakAmount: { 
                percentage: jsonData.evolution.stockBreakAmount.percentage,
                isPositive: jsonData.evolution.stockBreakAmount.percentage < 0,
                displayValue: stockBreakAmountDisplayValue
              },
              stockBreakQuantity: { 
                percentage: jsonData.evolution.stockBreakQuantity.percentage,
                isPositive: jsonData.evolution.stockBreakQuantity.percentage < 0,
                displayValue: stockBreakQuantityDisplayValue
              },
              stockBreakRate: { 
                points: jsonData.evolution.stockBreakRate.points,
                isPositive: jsonData.evolution.stockBreakRate.points < 0,
                displayValue: stockBreakRateDisplayValue
              },
              orders: { 
                percentage: jsonData.evolution.orders.percentage,
                isPositive: jsonData.evolution.orders.percentage < 0,
                displayValue: ordersDisplayValue
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