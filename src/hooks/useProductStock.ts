// src/hooks/useProductStock.ts
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useDataLoading } from '@/contexts/DataLoadingContext';

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
    isLoading: false,
    error: null
  });
  
  // Contextes
  const { startDate, endDate } = useDateRange();
  const { isReadyToLoad, createAbortSignal, incrementActiveRequests, decrementActiveRequests } = useDataLoading();
  
  // Référence pour éviter les appels multiples
  const isLoadingRef = useRef(false);
  
  useEffect(() => {
    // Ne se déclenche QUE si isReadyToLoad est true
    if (!isReadyToLoad) {
      return;
    }
    
    // Vérifier les prérequis
    if (!code13ref) {
      console.log('🔍 useProductStock: Code13ref manquant, pas de chargement');
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useProductStock: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchProductStockData();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchProductStockData = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useProductStock: Début du chargement des données de stock produit');
    
    try {
      const abortSignal = createAbortSignal();
      
      // Ajouter les paramètres de date à la requête
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      
      const url = `/api/products/${code13ref}/stock-analysis${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url, {
        signal: abortSignal
      });
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useProductStock: Requête annulée');
        return;
      }
      
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
      
      console.log('✅ useProductStock: Données de stock produit chargées avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useProductStock: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useProductStock: Erreur lors de la récupération des données:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }));
    } finally {
      isLoadingRef.current = false;
      decrementActiveRequests();
    }
  };
  
  return data;
}