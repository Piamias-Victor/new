// src/hooks/useSellInWithFilter.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';

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
  isLoading: boolean;
  error: string | null;
}

export function useSellInWithFilter() {
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
            pharmacyIds: selectedPharmacyIds,
            // Ajouter les codes EAN13 sélectionnés si le filtre est actif
            code13refs: isFilterActive ? selectedCodes : undefined
          }),
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données d\'achat');
        }
        
        const jsonData = await response.json();
        
        // Mettre à jour l'état avec les données reçues
        setData({
          totalPurchaseAmount: jsonData.current.purchaseAmount,
          totalPurchaseQuantity: jsonData.current.purchaseQuantity,
          totalStockBreakAmount: jsonData.current.stockBreakAmount,
          totalStockBreakQuantity: jsonData.current.stockBreakQuantity,
          stockBreakRate: jsonData.current.stockBreakRate,
          totalOrders: jsonData.current.ordersCount,
          comparison: jsonData.comparison,
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