// src/hooks/useSelectedProductsData.ts
import { useState, useEffect, useRef } from 'react';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useDataLoading } from '@/contexts/DataLoadingContext';

export interface ProductDetailData {
  id: string;
  display_name: string;
  code_13_ref: string;
  sell_out_price_ttc: number;
  brand_lab: string; // Ajout du nom du laboratoire
  sell_in_price_ht: number;
  margin_percentage: number;
  margin_amount: number;
  stock_value_ht: number;
  stock_quantity: number;
  sales_quantity: number;
  previous_sales_quantity: number;
  sales_evolution_percentage: number;
  // Totaux de vente pour la période
  total_sell_out: number;
  total_sell_in: number;
}

export function useSelectedProductsData() {
  const [products, setProducts] = useState<ProductDetailData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Contextes
  const { selectedCodes, isFilterActive } = useProductFilter();
  const { selectedPharmacyIds } = usePharmacySelection();
  const { startDate, endDate, comparisonStartDate, comparisonEndDate } = useDateRange();
  const { isReadyToLoad, createAbortSignal, incrementActiveRequests, decrementActiveRequests } = useDataLoading();
  
  // Référence pour éviter les appels multiples
  const isLoadingRef = useRef(false);
  
  useEffect(() => {
    // Ne se déclenche QUE si isReadyToLoad est true
    if (!isReadyToLoad) {
      return;
    }
    
    // Si aucun produit n'est sélectionné, ne rien charger
    if (!isFilterActive || selectedCodes.length === 0) {
      console.log('🔍 useSelectedProductsData: Aucun produit sélectionné, pas de chargement');
      setProducts([]);
      setIsLoading(false);
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useSelectedProductsData: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchSelectedProductsData();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchSelectedProductsData = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setIsLoading(true);
    setError(null);
    
    console.log('🔍 useSelectedProductsData: Début du chargement des données produits sélectionnés');
    
    try {
      const abortSignal = createAbortSignal();
      
      const response = await fetch('/api/products/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code13refs: selectedCodes,
          pharmacyIds: selectedPharmacyIds,
          allPharmacies: selectedPharmacyIds.length === 0, // Flag pour indiquer toutes les pharmacies
          startDate,
          endDate,
          comparisonStartDate,
          comparisonEndDate
        }),
        signal: abortSignal
      });
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useSelectedProductsData: Requête annulée');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données produits');
      }
      
      const data = await response.json();
      setProducts(data.products || []);
      
      console.log('✅ useSelectedProductsData: Données produits sélectionnés chargées avec succès');
      
    } catch (err) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('🔍 useSelectedProductsData: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useSelectedProductsData: Erreur lors de la récupération des données:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      isLoadingRef.current = false;
      decrementActiveRequests();
      setIsLoading(false);
    }
  };
  
  return { products, isLoading, error };
}