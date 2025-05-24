// src/hooks/useProductMargins.ts
import { useState, useEffect, useRef } from 'react';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { useDataLoading } from '@/contexts/DataLoadingContext';

export interface MarginProductData {
  id: string;
  product_name: string;
  global_name: string;
  display_name: string;
  category: string;
  brand_lab: string;
  code_13_ref: string;
  current_stock: number;
  price_with_tax: number;
  weighted_average_price: number;
  margin_percentage: number;
  margin_amount: number;
  total_sales: number;
}

interface ProductMarginsData {
  negativeMargin: MarginProductData[];
  lowMargin: MarginProductData[];
  mediumMargin: MarginProductData[];
  goodMargin: MarginProductData[];
  excellentMargin: MarginProductData[];
  isLoading: boolean;
  error: string | null;
}

export function useProductMarginsFiltered(): ProductMarginsData {
  const [data, setData] = useState<ProductMarginsData>({
    negativeMargin: [],
    lowMargin: [],
    mediumMargin: [],
    goodMargin: [],
    excellentMargin: [],
    isLoading: false,
    error: null
  });
  
  // Contextes
  const { selectedPharmacyIds } = usePharmacySelection();
  const { selectedCodes, isFilterActive } = useProductFilter();
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
    if (!startDate || !endDate) {
      console.log('🔍 useProductMarginsFiltered: Dates manquantes, pas de chargement');
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: "Dates de période manquantes"
      }));
      return;
    }
    
    // Si aucun produit n'est sélectionné alors que le filtre est actif, on retourne des tableaux vides
    if (isFilterActive && selectedCodes.length === 0) {
      console.log('🔍 useProductMarginsFiltered: Aucun produit sélectionné avec filtre actif');
      setData(prev => ({
        ...prev,
        isLoading: false
      }));
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useProductMarginsFiltered: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchProductMargins();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchProductMargins = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useProductMarginsFiltered: Début du chargement des marges produits');
    
    try {
      const abortSignal = createAbortSignal();
      
      // Utiliser POST pour envoyer les données dans le corps
      const response = await fetch('/api/products/margins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pharmacyIds: selectedPharmacyIds.length > 0 ? selectedPharmacyIds : [],
          code13refs: isFilterActive ? selectedCodes : [],
          startDate: startDate,
          endDate: endDate,
          onlySoldProducts: true // Ne retourner que les produits vendus sur la période
        }),
        cache: 'no-store',
        signal: abortSignal
      });
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useProductMarginsFiltered: Requête annulée');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des données');
      }
      
      const result = await response.json();
      
      setData({
        negativeMargin: result.negativeMargin || [],
        lowMargin: result.lowMargin || [],
        mediumMargin: result.mediumMargin || [],
        goodMargin: result.goodMargin || [],
        excellentMargin: result.excellentMargin || [],
        isLoading: false,
        error: null
      });
      
      console.log('✅ useProductMarginsFiltered: Marges produits chargées avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useProductMarginsFiltered: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useProductMarginsFiltered: Erreur lors de la récupération des données:', error);
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