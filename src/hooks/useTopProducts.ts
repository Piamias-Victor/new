// src/hooks/useTopProducts.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

export type SortByType = 'revenue' | 'quantity' | 'margin';

export interface TopProduct {
  product_id: string;
  product_name: string;
  display_name: string;
  category: string;
  brand_lab: string;
  tva_rate: number;
  code_13_ref: string;
  current_stock: number;
  total_quantity: number;
  total_revenue: number;
  total_margin: number;
  margin_percentage: number;
}

interface TopProductsData {
  byRevenue: TopProduct[];
  byQuantity: TopProduct[];
  byMargin: TopProduct[];
  isLoading: boolean;
  error: string | null;
}

export function useTopProducts(limit: number = 10): TopProductsData {
  const [data, setData] = useState<TopProductsData>({
    byRevenue: [],
    byQuantity: [],
    byMargin: [],
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  
  useEffect(() => {
    async function fetchTopProducts() {
      // Vérifier que les dates sont disponibles
      if (!startDate || !endDate) {
        return;
      }
      
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Préparer les paramètres de la requête
        const params = new URLSearchParams({
          startDate,
          endDate,
          limit: limit.toString()
        });
        
        // Si on a une sélection spécifique, on l'ajoute aux paramètres
        if (selectedPharmacyIds.length > 0) {
          selectedPharmacyIds.forEach(id => {
            params.append('pharmacyIds', id);
          });
        }
        
        // Effectuer la requête
        const response = await fetch(`/api/products/top?${params}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des données');
        }
        
        const result = await response.json();
        
        // S'assurer que les tableaux existent et ne sont pas null
        const byRevenue = Array.isArray(result.byRevenue) ? result.byRevenue : [];
        const byQuantity = Array.isArray(result.byQuantity) ? result.byQuantity : [];
        
        // Pour le tri par marge, si byMargin n'est pas disponible dans l'API,
        // nous pouvons le calculer en triant les produits par marge
        let byMargin: TopProduct[] = [];
        
        if (Array.isArray(result.byMargin)) {
          byMargin = result.byMargin;
        } else {
          // Utiliser les données de revenu et les trier par marge totale
          byMargin = [...byRevenue].sort((a, b) => {
            return b.total_margin - a.total_margin;
          });
        }
        
        // Pour chaque produit, s'assurer que les valeurs margin_percentage sont correctes
        // Si elles sont manquantes, les calculer
        const ensureMarginPercentage = (products: TopProduct[]): TopProduct[] => {
          return products.map(product => {
            if (product.margin_percentage === undefined || product.margin_percentage === null) {
              // Calculer le pourcentage de marge si manquant
              const marginPercentage = product.total_revenue > 0 
                ? (product.total_margin / product.total_revenue) * 100 
                : 0;
              
              return {
                ...product,
                margin_percentage: parseFloat(marginPercentage.toFixed(1))
              };
            }
            return product;
          });
        };
        
        // Mettre à jour les états avec les valeurs calculées
        setData({
          byRevenue: ensureMarginPercentage(byRevenue),
          byQuantity: ensureMarginPercentage(byQuantity),
          byMargin: ensureMarginPercentage(byMargin),
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur dans useTopProducts:', error);
        setData({
          byRevenue: [],
          byQuantity: [],
          byMargin: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
    
    fetchTopProducts();
  }, [startDate, endDate, selectedPharmacyIds, limit]);
  
  return data;
}