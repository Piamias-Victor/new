// src/hooks/usePurchaseData.ts
import { useState, useEffect } from 'react';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useDateRange } from '@/contexts/DateRangeContext';
import { Product } from '@/services/productService';

export interface PurchaseDataSummary {
  totalPurchaseAmount: number;
  totalPurchaseQuantity: number;
  averagePurchasePrice: number;
  lastPurchaseDate: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook personnalisé pour récupérer les données d'achat (sell-in) des produits
 * pour les pharmacies et la période sélectionnées
 */
export function usePurchaseData(products: Product[]): PurchaseDataSummary {
  const [data, setData] = useState<PurchaseDataSummary>({
    totalPurchaseAmount: 0,
    totalPurchaseQuantity: 0,
    averagePurchasePrice: 0,
    lastPurchaseDate: 'Non disponible',
    isLoading: true,
    error: null
  });
  
  const { selectedPharmacyIds } = usePharmacySelection();
  const { startDate, endDate } = useDateRange();
  
  useEffect(() => {
    async function fetchPurchaseData() {
      if (!products || products.length === 0) {
        setData(prev => ({...prev, isLoading: false}));
        return;
      }
      
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Récupérer les IDs des produits
        const productIds = products.map(product => product.id);
        
        // Préparer les paramètres pour la requête
        const params = new URLSearchParams();
        
        // Toujours inclure les dates - c'est crucial pour le filtrage correct
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        // Ajouter les IDs de produits
        productIds.forEach(id => {
          params.append('productIds', id);
        });
        
        // Ajouter les IDs des pharmacies sélectionnées
        if (selectedPharmacyIds.length > 0) {
          selectedPharmacyIds.forEach(id => {
            params.append('pharmacyIds', id);
          });
        }
        
        // Effectuer la requête API
        const response = await fetch(`/api/products/purchases?${params}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(`Erreur lors de la récupération des données d'achat: ${response.status}`);
        }
        
        const result = await response.json();
        
        setData({
          totalPurchaseAmount: result.totalPurchaseAmount || 0,
          totalPurchaseQuantity: result.totalPurchaseQuantity || 0,
          averagePurchasePrice: result.averagePurchasePrice || 0,
          lastPurchaseDate: result.lastPurchaseDate || 'Non disponible',
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur dans usePurchaseData:', error);
        
        // En cas d'erreur, on calcule des valeurs approximatives à partir des produits disponibles
        const estimatedPurchaseAmount = products.reduce(
          (sum, product) => sum + (Number(product.current_stock || 0) * Number(product.weighted_average_price || 0)), 
          0
        );
        
        const estimatedPurchaseQuantity = products.reduce(
          (sum, product) => sum + (Number(product.current_stock || 0) * 1.2), // Stock + 20% (estimation)
          0
        );
        
        setData({
          totalPurchaseAmount: estimatedPurchaseAmount,
          totalPurchaseQuantity: estimatedPurchaseQuantity,
          averagePurchasePrice: estimatedPurchaseQuantity > 0 ? estimatedPurchaseAmount / estimatedPurchaseQuantity : 0,
          lastPurchaseDate: 'Non disponible',
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
    
    fetchPurchaseData();
  }, [products, startDate, endDate, selectedPharmacyIds]);
  
  return data;
}