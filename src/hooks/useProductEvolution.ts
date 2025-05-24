// src/hooks/useProductEvolution.ts
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { useDataLoading } from '@/contexts/DataLoadingContext';

// Définition des données de produit pour l'évolution
export interface EvolutionProductData {
  id: string;
  display_name: string;
  code_13_ref: string;
  category?: string;
  brand_lab?: string;
  current_stock: number;
  current_revenue: number;
  previous_revenue: number;
  evolution_percentage: number;
}

// Définition de la structure de données principale
interface ProductEvolutionData {
  strongDecrease: EvolutionProductData[];
  slightDecrease: EvolutionProductData[];
  stable: EvolutionProductData[];
  slightIncrease: EvolutionProductData[];
  strongIncrease: EvolutionProductData[];
  isLoading: boolean;
  error: string | null;
}

export function useProductEvolution(): ProductEvolutionData {
  const [data, setData] = useState<ProductEvolutionData>({
    strongDecrease: [],
    slightDecrease: [],
    stable: [],
    slightIncrease: [],
    strongIncrease: [],
    isLoading: false,
    error: null
  });
  
  // Contextes
  const { startDate, endDate, comparisonStartDate, comparisonEndDate, isComparisonEnabled } = useDateRange();
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
    if (!startDate || !endDate || !isComparisonEnabled || !comparisonStartDate || !comparisonEndDate) {
      console.log('🔍 useProductEvolution: Prérequis manquants, pas de chargement');
      setData(prev => ({ 
        ...prev, 
        isLoading: false,
        strongDecrease: [],
        slightDecrease: [],
        stable: [],
        slightIncrease: [],
        strongIncrease: []
      }));
      return;
    }
    
    // Pas besoin de faire de requête si aucun produit n'est sélectionné
    if (isFilterActive && selectedCodes.length === 0) {
      console.log('🔍 useProductEvolution: Aucun produit sélectionné avec filtre actif');
      setData({
        strongDecrease: [],
        slightDecrease: [],
        stable: [],
        slightIncrease: [],
        strongIncrease: [],
        isLoading: false,
        error: null
      });
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useProductEvolution: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchProductEvolution();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchProductEvolution = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useProductEvolution: Début du chargement de l\'évolution des produits');
    
    try {
      const abortSignal = createAbortSignal();
      
      // Détermine si on doit utiliser POST ou GET en fonction du nombre de codes
      const shouldUsePost = isFilterActive && selectedCodes.length > 20;
      let response;
      
      if (shouldUsePost) {
        // Utiliser POST pour les grandes listes de codes
        response = await fetch('/api/products/evolution', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate,
            endDate,
            comparisonStartDate,
            comparisonEndDate,
            pharmacyIds: selectedPharmacyIds.length > 0 ? selectedPharmacyIds : [],
            code13refs: isFilterActive ? selectedCodes : []
          }),
          cache: 'no-store',
          signal: abortSignal
        });
      } else {
        // Préparer les paramètres pour GET
        const params = new URLSearchParams({
          startDate,
          endDate,
          comparisonStartDate,
          comparisonEndDate
        });
        
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
        response = await fetch(`/api/products/evolution?${params}`, {
          cache: 'no-store',
          signal: abortSignal
        });
      }
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useProductEvolution: Requête annulée');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des données');
      }
      
      const result = await response.json();
      
      setData({
        strongDecrease: result.strongDecrease || [],
        slightDecrease: result.slightDecrease || [],
        stable: result.stable || [],
        slightIncrease: result.slightIncrease || [],
        strongIncrease: result.strongIncrease || [],
        isLoading: false,
        error: null
      });
      
      console.log('✅ useProductEvolution: Évolution des produits chargée avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useProductEvolution: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useProductEvolution: Erreur lors de la récupération des données:', error);
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