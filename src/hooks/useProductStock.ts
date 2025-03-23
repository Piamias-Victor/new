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
    order_id: string;
    date: string;
    quantity: number;
    received_quantity: number;
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
        // Ajouter les paramètres de date à la requête
        const queryParams = new URLSearchParams();
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);
        
        const url = `/api/products/${code13ref}/stock-analysis${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des données de stock');
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