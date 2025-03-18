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
  firstPurchaseDate?: string; // Ajouté pour correspondre à l'API
  totalOrders?: number; // Ajouté pour correspondre à l'API
  deliveryRate?: number; // Ajouté pour correspondre à l'API
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
        console.log("usePurchaseData: Aucun produit à analyser, retour des données par défaut");
        setData(prev => ({...prev, isLoading: false}));
        return;
      }
      
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Récupérer les IDs des produits
        const productIds = products.map(product => product.id);
        console.log("usePurchaseData: IDs des produits", productIds);
        
        // Préparer les paramètres pour la requête
        const params = new URLSearchParams();
        
        // Toujours inclure les dates - c'est crucial pour le filtrage correct
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        console.log(`usePurchaseData: Période de requête - ${startDate} à ${endDate}`);
        
        // Ajouter les IDs de produits
        productIds.forEach(id => {
          params.append('productIds', id);
        });
        
        // Ajouter les IDs des pharmacies sélectionnées
        if (selectedPharmacyIds.length > 0) {
          selectedPharmacyIds.forEach(id => {
            params.append('pharmacyIds', id);
          });
          console.log(`usePurchaseData: Filtrage par ${selectedPharmacyIds.length} pharmacies`);
        }
        
        // Logger l'URL complète pour le débogage
        const apiUrl = `/api/products/purchases?${params}`;
        console.log("usePurchaseData: URL de l'API appelée:", apiUrl);
        
        // Effectuer la requête API
        const response = await fetch(apiUrl, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("usePurchaseData: Réponse de l'API en erreur:", response.status, errorText);
          throw new Error(`Erreur lors de la récupération des données d'achat: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log("usePurchaseData: Données reçues de l'API:", result);
        
        setData({
          totalPurchaseAmount: result.totalPurchaseAmount || 0,
          totalPurchaseQuantity: result.totalPurchaseQuantity || 0,
          averagePurchasePrice: result.averagePurchasePrice || 0,
          lastPurchaseDate: result.lastPurchaseDate || 'Non disponible',
          firstPurchaseDate: result.firstPurchaseDate,
          totalOrders: result.totalOrders,
          deliveryRate: result.deliveryRate,
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
        
        console.log("usePurchaseData: Utilisation de données estimées après erreur:", {
          estimatedPurchaseAmount,
          estimatedPurchaseQuantity
        });
        
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