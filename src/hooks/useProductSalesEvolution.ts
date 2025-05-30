// src/hooks/useProductSalesEvolution.ts
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useDataLoading } from '@/contexts/DataLoadingContext';
import { Product } from '@/services/productService';

interface SalesDataItem {
  period: string;
  quantity: number;
  revenue: number;
  margin: number;
  margin_percentage: number;
}

interface TotalDataItem {
  period: string;
  total_quantity: number;
  total_revenue: number;
  total_margin: number;
  margin_percentage: number;
}

interface ProductData {
  name: string;
  category: string;
  brand_lab: string;
  data: SalesDataItem[];
}

interface PharmacyData {
  name: string;
  data: SalesDataItem[];
}

interface ProductSalesEvolutionData {
  totalData: TotalDataItem[];
  productData: Record<string, ProductData>;
  pharmacyData: Record<string, PharmacyData>;
  isLoading: boolean;
  error: string | null;
}

export function useProductSalesEvolution(
  products: Product[],
  interval: 'day' | 'week' | 'month' = 'day'
): ProductSalesEvolutionData {
  const [data, setData] = useState<ProductSalesEvolutionData>({
    totalData: [],
    productData: {},
    pharmacyData: {},
    isLoading: false,
    error: null
  });
  
  // Contextes
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  const { isReadyToLoad, createAbortSignal, incrementActiveRequests, decrementActiveRequests } = useDataLoading();
  
  // Référence pour éviter les appels multiples
  const isLoadingRef = useRef(false);
  
  useEffect(() => {
    // Ne se déclenche QUE si isReadyToLoad est true
    if (!isReadyToLoad) {
      return;
    }
    
    // Vérifier les prérequis
    if (!startDate || !endDate || products.length === 0) {
      console.log('🔍 useProductSalesEvolution: Prérequis manquants, pas de chargement');
      setData(prev => ({ 
        ...prev, 
        isLoading: false,
        totalData: [],
        productData: {},
        pharmacyData: {}
      }));
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useProductSalesEvolution: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchSalesEvolution();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchSalesEvolution = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useProductSalesEvolution: Début du chargement de l\'évolution des ventes produits');
    
    try {
      const abortSignal = createAbortSignal();
      
      // Préparer les données pour la requête POST
      const requestData = {
        startDate,
        endDate,
        interval,
        // Ajouter chaque ID de produit 
        productIds: products.map(product => product.id),
        // Ajouter les IDs de pharmacie si spécifiés
        ...(selectedPharmacyIds.length > 0 && { pharmacyIds: selectedPharmacyIds })
      };
      
      // Effectuer la requête POST
      const response = await fetch('/api/products/sales-evolution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        cache: 'no-store',
        signal: abortSignal
      });
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useProductSalesEvolution: Requête annulée');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des données');
      }
      
      const result = await response.json();
      
      setData({
        totalData: result.totalData || [],
        productData: result.productData || {},
        pharmacyData: result.pharmacyData || {},
        isLoading: false,
        error: null
      });
      
      console.log('✅ useProductSalesEvolution: Évolution des ventes produits chargée avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useProductSalesEvolution: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useProductSalesEvolution: Erreur lors de la récupération des données:', error);
      setData({
        totalData: [],
        productData: {},
        pharmacyData: {},
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