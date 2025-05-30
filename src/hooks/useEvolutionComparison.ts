// src/hooks/useEvolutionComparison.ts
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useDataLoading } from '@/contexts/DataLoadingContext';

export interface ProductEvolution {
  product_id: string;
  display_name: string;
  code_13_ref: string;
  category: string;
  brand_lab: string;
  current_stock: number;
  current_revenue: number;
  previous_revenue: number;
  evolution_percentage: number;
}

export interface EvolutionCategoryData {
  name: string;
  description: string;
  count: number;
  products: ProductEvolution[];
  color: string;
}

interface EvolutionComparisonData {
  categories: {
    strongDecrease: EvolutionCategoryData;
    slightDecrease: EvolutionCategoryData;
    stable: EvolutionCategoryData;
    slightIncrease: EvolutionCategoryData;
    strongIncrease: EvolutionCategoryData;
  };
  globalComparison: {
    currentPeriodRevenue: number;
    previousPeriodRevenue: number;
    evolutionPercentage: number;
  };
  isLoading: boolean;
  error: string | null;
}

export function useEvolutionComparison(): EvolutionComparisonData {
  const [data, setData] = useState<EvolutionComparisonData>({
    categories: {
      strongDecrease: { 
        name: 'Forte baisse', 
        description: 'Baisse > 15%', 
        count: 0, 
        products: [],
        color: 'red'
      },
      slightDecrease: { 
        name: 'Légère baisse', 
        description: 'Baisse entre 5% et 15%', 
        count: 0, 
        products: [],
        color: 'amber'
      },
      stable: { 
        name: 'Stable', 
        description: 'Variation entre -5% et 5%', 
        count: 0, 
        products: [],
        color: 'blue'
      },
      slightIncrease: { 
        name: 'Légère hausse', 
        description: 'Hausse entre 5% et 15%', 
        count: 0, 
        products: [],
        color: 'green'
      },
      strongIncrease: { 
        name: 'Forte hausse', 
        description: 'Hausse > 15%', 
        count: 0, 
        products: [],
        color: 'purple'
      }
    },
    globalComparison: {
      currentPeriodRevenue: 0,
      previousPeriodRevenue: 0,
      evolutionPercentage: 0
    },
    isLoading: false,
    error: null
  });
  
  // Contextes
  const { startDate, endDate, comparisonStartDate, comparisonEndDate, isComparisonEnabled } = useDateRange();
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
    if (!startDate || !endDate || !isComparisonEnabled || !comparisonStartDate || !comparisonEndDate) {
      console.log('🔍 useEvolutionComparison: Prérequis manquants, pas de chargement');
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useEvolutionComparison: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchEvolutionData();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchEvolutionData = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useEvolutionComparison: Début du chargement des données d\'évolution');
    
    try {
      const abortSignal = createAbortSignal();
      
      // Préparer les paramètres de la requête
      const params = new URLSearchParams({
        startDate,
        endDate,
        comparisonStartDate,
        comparisonEndDate
      });
      
      // Ajouter les IDs des pharmacies sélectionnées
      if (selectedPharmacyIds.length > 0) {
        selectedPharmacyIds.forEach(id => {
          params.append('pharmacyIds', id);
        });
      }
      
      // Effectuer la requête
      const response = await fetch(`/api/sales/evolution-comparison?${params}`, {
        cache: 'no-store',
        signal: abortSignal
      });
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useEvolutionComparison: Requête annulée');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des données d\'évolution');
      }
      
      const result = await response.json();
      
      // Mise à jour des données
      setData({
        categories: {
          strongDecrease: { 
            ...data.categories.strongDecrease, 
            count: result.categories.strongDecrease.length,
            products: result.categories.strongDecrease 
          },
          slightDecrease: { 
            ...data.categories.slightDecrease, 
            count: result.categories.slightDecrease.length,
            products: result.categories.slightDecrease 
          },
          stable: { 
            ...data.categories.stable, 
            count: result.categories.stable.length,
            products: result.categories.stable 
          },
          slightIncrease: { 
            ...data.categories.slightIncrease, 
            count: result.categories.slightIncrease.length,
            products: result.categories.slightIncrease 
          },
          strongIncrease: { 
            ...data.categories.strongIncrease, 
            count: result.categories.strongIncrease.length,
            products: result.categories.strongIncrease 
          },
        },
        globalComparison: result.globalComparison,
        isLoading: false,
        error: null
      });
      
      console.log('✅ useEvolutionComparison: Données d\'évolution chargées avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useEvolutionComparison: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useEvolutionComparison: Erreur lors de la récupération des données d\'évolution:', error);
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