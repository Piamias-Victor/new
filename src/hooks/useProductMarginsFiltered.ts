// src/hooks/useProductMarginsFiltered.ts
import { useState, useEffect, useRef } from 'react';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { useDataLoading } from '@/contexts/DataLoadingContext';
import { MarginProductData } from '@/hooks/useProductMargins';

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
  const { isReadyToLoad, createAbortSignal, incrementActiveRequests, decrementActiveRequests } = useDataLoading();
  
  // Référence pour éviter les appels multiples
  const isLoadingRef = useRef(false);
  
  useEffect(() => {
    // Ne se déclenche QUE si isReadyToLoad est true
    if (!isReadyToLoad) {
      return;
    }
    
    // Pas besoin de faire de requête si aucun produit n'est sélectionné
    if (isFilterActive && selectedCodes.length === 0) {
      console.log('🔍 useProductMarginsFiltered: Aucun produit sélectionné avec filtre actif');
      setData({
        negativeMargin: [],
        lowMargin: [],
        mediumMargin: [],
        goodMargin: [],
        excellentMargin: [],
        isLoading: false,
        error: null
      });
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
    
    console.log('🔍 useProductMarginsFiltered: Début du chargement des marges produits filtrées');
    
    try {
      const abortSignal = createAbortSignal();
      
      // Détermine si on doit utiliser POST ou GET en fonction du nombre de codes
      const shouldUsePost = isFilterActive && selectedCodes.length > 20;
      let response;
      
      if (shouldUsePost) {
        // Utiliser POST pour les grandes listes de codes
        response = await fetch('/api/products/margins', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pharmacyIds: selectedPharmacyIds.length > 0 ? selectedPharmacyIds : [],
            code13refs: isFilterActive ? selectedCodes : []
          }),
          cache: 'no-store',
          signal: abortSignal
        });
      } else {
        // Préparer les paramètres pour GET
        const params = new URLSearchParams();
        
        // Si on a une sélection spécifique de pharmacies
        if (selectedPharmacyIds.length > 0) {
          selectedPharmacyIds.forEach(id => {
            params.append('pharmacyIds', id);
          });
        }
        
        // Si on a une sélection de codes EAN13
        if (isFilterActive && selectedCodes.length > 0) {
          selectedCodes.forEach(code => {
            params.append('code13refs', code);
          });
        }
        
        // Effectuer la requête GET
        response = await fetch(`/api/products/margins?${params}`, {
          cache: 'no-store',
          signal: abortSignal
        });
      }
      
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
      
      console.log('✅ useProductMarginsFiltered: Marges produits filtrées chargées avec succès');
      
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