// src/hooks/useSalesEvolutionComparison.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

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
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate, comparisonStartDate, comparisonEndDate, isComparisonEnabled } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  
  useEffect(() => {
    async function fetchEvolutionData() {
      // Vérifier que les dates et la comparaison sont disponibles
      if (!startDate || !endDate || !isComparisonEnabled || !comparisonStartDate || !comparisonEndDate) {
        setData(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
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
          cache: 'no-store'
        });
        
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
      } catch (error) {
        console.error('Erreur dans useSalesEvolutionComparison:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }));
      }
    }
    
    fetchEvolutionData();
  }, [startDate, endDate, comparisonStartDate, comparisonEndDate, selectedPharmacyIds, isComparisonEnabled]);
  
  return data;
}