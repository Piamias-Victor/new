// src/hooks/useSellIn.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

interface SellInEvolution {
  absolute: number;
  percentage: number;
  isPositive: boolean;
}

interface SellInComparison {
  startDate: string;
  endDate: string;
  actualDateRange?: {
    min: string;
    max: string;
    days: number;
  };
  totalPurchaseQuantity: number;
  totalPurchaseAmount: number;
  totalOrders: number;
  averagePurchasePrice: number;
  // Nouvelles propriétés pour les ruptures
  totalOrderedQuantity: number;
  totalStockBreakQuantity: number;
  totalStockBreakAmount: number;
  stockBreakRate: number;
  evolution: {
    purchaseQuantity: SellInEvolution;
    purchaseAmount: SellInEvolution;
    orders: SellInEvolution;
    averagePurchasePrice: SellInEvolution;
    // Nouvelles évolutions pour les ruptures
    stockBreakQuantity: SellInEvolution;
    stockBreakAmount: SellInEvolution;
    stockBreakRate: SellInEvolution;
  };
}

interface SellInData {
  totalPurchaseQuantity: number;
  totalPurchaseAmount: number;
  totalOrders: number;
  averagePurchasePrice: number;
  // Nouvelles propriétés pour les ruptures
  totalOrderedQuantity: number;
  totalStockBreakQuantity: number;
  totalStockBreakAmount: number;
  stockBreakRate: number;
  isLoading: boolean;
  error: string | null;
  actualDateRange?: {
    min: string;
    max: string;
    days: number;
  };
  comparison?: SellInComparison;
}

export function useSellIn(): SellInData {
  const [data, setData] = useState<SellInData>({
    totalPurchaseQuantity: 0,
    totalPurchaseAmount: 0,
    totalOrders: 0,
    averagePurchasePrice: 0,
    // Initialisation des nouvelles propriétés
    totalOrderedQuantity: 0,
    totalStockBreakQuantity: 0,
    totalStockBreakAmount: 0,
    stockBreakRate: 0,
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate, comparisonStartDate, comparisonEndDate, isComparisonEnabled } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  
  // Fonction pour récupérer les données de sell-in (achats) et ruptures
  const fetchSellIn = async () => {
    // Vérifier que les dates sont disponibles
    if (!startDate || !endDate) {
      return;
    }
    
    try {
      // Mettre à jour l'état pour indiquer le chargement
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Préparer les données pour la requête POST
      const requestData = {
        startDate,
        endDate,
        // Ajouter les dates de comparaison si activées
        ...(isComparisonEnabled && comparisonStartDate && comparisonEndDate && {
          comparisonStartDate,
          comparisonEndDate
        }),
        // Ajouter les IDs de pharmacie sélectionnées
        pharmacyIds: selectedPharmacyIds
      };
      
      // Effectuer la requête POST
      const response = await fetch('/api/sales/sellin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        cache: 'no-store'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des données');
      }
      
      const result = await response.json();
      
      // Mettre à jour l'état avec les données reçues, y compris les ruptures
      setData({
        totalPurchaseQuantity: result.totalPurchaseQuantity,
        totalPurchaseAmount: result.totalPurchaseAmount,
        totalOrders: result.totalOrders,
        averagePurchasePrice: result.averagePurchasePrice,
        // Mise à jour des données de rupture
        totalOrderedQuantity: result.totalOrderedQuantity || 0,
        totalStockBreakQuantity: result.totalStockBreakQuantity || 0,
        totalStockBreakAmount: result.totalStockBreakAmount || 0,
        stockBreakRate: result.stockBreakRate || 0,
        actualDateRange: result.actualDateRange,
        comparison: result.comparison,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Erreur dans useSellIn:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }));
    }
  };
  
  // Déclencher la requête lorsque les dépendances changent
  useEffect(() => {
    fetchSellIn();
  }, [startDate, endDate, comparisonStartDate, comparisonEndDate, selectedPharmacyIds, isComparisonEnabled]);
  
  return data;
}