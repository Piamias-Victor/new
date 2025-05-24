// src/hooks/useTopProducts.ts
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { useDataLoading } from '@/contexts/DataLoadingContext';

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
    isLoading: false,
    error: null
  });
  
  // Contextes
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  const { selectedCodes, isFilterActive } = useProductFilter();
  const { isReadyToLoad, createAbortSignal, incrementActiveRequests, decrementActiveRequests } = useDataLoading();
  
  // Référence pour éviter les appels multiples
  const isLoadingRef = useRef(false);
  
  useEffect(() => {
    // Ne se déclenche QUE si isReadyToLoad est true
    if (!isReadyToLoad) {
      return;
    }
    
    // Vérifier les prérequis
    if (!startDate || !endDate) {
      console.log('🔍 useTopProducts: Dates manquantes, pas de chargement');
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useTopProducts: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchTopProducts();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchTopProducts = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useTopProducts: Début du chargement des top produits');
    console.log("=== DÉBUT DEBUG useTopProducts ===");
    console.log("Dates:", { startDate, endDate });
    console.log("Pharmacies:", { selectedPharmacyIds });
    console.log("Filter actif?", isFilterActive);
    console.log("Selected codes:", selectedCodes);
    console.log("Limit:", limit);
    
    try {
      const abortSignal = createAbortSignal();
      
      // Filtrer pour éliminer les valeurs problématiques
      const validPharmacyIds = selectedPharmacyIds.filter(id => 
        id && typeof id === 'string' && id !== 'NaN' && id !== 'undefined' && id !== 'null'
      );
      
      const validCodes = isFilterActive 
        ? selectedCodes.filter(code => 
            code && typeof code === 'string' && code !== 'NaN' && code !== 'undefined' && code !== 'null'
          )
        : [];
      
      // S'assurer que limit est un nombre valide
      const safeLimit = !isNaN(limit) && isFinite(limit) ? limit : 10;
      
      // Préparer le corps de la requête
      const requestBody = {
        startDate,
        endDate,
        limit: safeLimit,
        pharmacyIds: validPharmacyIds,
        code13refs: validCodes
      };
      
      console.log("Requête POST avec body:", JSON.stringify(requestBody));
      
      // Toujours utiliser POST
      const response = await fetch('/api/products/top', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        cache: 'no-store',
        signal: abortSignal
      });
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useTopProducts: Requête annulée');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des données');
      }
      
      const result = await response.json();
      console.log("Résultat reçu:", { 
        byRevenueCount: result.byRevenue?.length || 0,
        byQuantityCount: result.byQuantity?.length || 0,
        byMarginCount: result.byMargin?.length || 0
      });
      
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
      
      console.log("=== FIN DEBUG useTopProducts ===");
      console.log('✅ useTopProducts: Top produits chargés avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useTopProducts: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useTopProducts: Erreur lors de la récupération des données:', error);
      setData({
        byRevenue: [],
        byQuantity: [],
        byMargin: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      isLoadingRef.current = false;
      decrementActiveRequests();
    }
  };
  
  return data;
}