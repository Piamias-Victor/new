// src/hooks/useSalesEvolutionComparison.ts
import { useState, useEffect, useRef } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useDataLoading } from '@/contexts/DataLoadingContext';

export interface ProductEvolution {
  id: string;
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

export interface EvolutionCategory {
  name: string;
  description: string;
  count: number;
  products: ProductEvolution[];
  color: string;
}

interface SalesEvolutionComparisonData {
  categories: {
    strongDecrease: EvolutionCategory;
    slightDecrease: EvolutionCategory;
    stable: EvolutionCategory;
    slightIncrease: EvolutionCategory;
    strongIncrease: EvolutionCategory;
  };
  globalComparison: {
    currentPeriodRevenue: number;
    previousPeriodRevenue: number;
    evolutionPercentage: number;
    currentPeriodMargin: number;
    previousPeriodMargin: number;
    marginEvolutionPercentage: number;
  };
  isLoading: boolean;
  error: string | null;
}

export function useSalesEvolutionComparison(): SalesEvolutionComparisonData {
  
  const [data, setData] = useState<SalesEvolutionComparisonData>({
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
      evolutionPercentage: 0,
      currentPeriodMargin: 0,
      previousPeriodMargin: 0,
      marginEvolutionPercentage: 0
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
      console.log('🔍 useSalesEvolutionComparison: Prérequis manquants, pas de chargement');
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useSalesEvolutionComparison: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchEvolutionData();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchEvolutionData = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useSalesEvolutionComparison: Début du chargement de la comparaison d\'évolution des ventes');
    
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
        console.log('🔍 useSalesEvolutionComparison: Requête annulée');
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
      
      console.log('✅ useSalesEvolutionComparison: Comparaison d\'évolution des ventes chargée avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useSalesEvolutionComparison: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useSalesEvolutionComparison: Erreur lors de la récupération des données:', error);
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