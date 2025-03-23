// src/hooks/useProductStock.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';

export interface ProductStockData {
  // Données principales
  code13ref: string;
  currentStock: number;
  stockValue: number;
  avgCostPrice: number;
  
  // Métriques clés
  daysOfStock: number;
  monthsOfStock: number;
  rotationRate: number;
  ruptureTreshold: number;
  
  // Prévisions et risques
  forecastedStockDate: string;
  stockoutRisk: 'low' | 'medium' | 'high' | 'critical';
  stockoutRiskDate: string | null;
  
  // Données d'approvisionnement
  lastOrders: {
    orderId: string;
    date: string;
    quantity: number;
    receivedQuantity: number;
    status: string;
  }[];
  
  // Données pour le réapprovisionnement
  optimalStock: number;
  suggestedOrderQuantity: number;
  
  isLoading: boolean;
  error: string | null;
}

export function useProductStock(code13ref: string): ProductStockData {
  const [data, setData] = useState<ProductStockData>({
    code13ref: "",
    currentStock: 0,
    stockValue: 0,
    avgCostPrice: 0,
    daysOfStock: 0,
    monthsOfStock: 0,
    rotationRate: 0,
    ruptureTreshold: 0,
    forecastedStockDate: "",
    stockoutRisk: "low",
    stockoutRiskDate: null,
    lastOrders: [],
    optimalStock: 0,
    suggestedOrderQuantity: 0,
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate } = useDateRange();
  
  useEffect(() => {
    async function fetchProductStockData() {
      if (!code13ref) return;
      
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const response = await fetch(`/api/products/${code13ref}/stock-analysis`);
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données de stock');
        }
        
        const result = await response.json();
        setData({
          ...result,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur dans useProductStock:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }));
      }
    }
    
    fetchProductStockData();
  }, [code13ref, startDate, endDate]);
  
  return data;
}