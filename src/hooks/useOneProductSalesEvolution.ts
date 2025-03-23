// src/hooks/useOneProductSalesEvolution.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';

export interface SalesDataItem {
  period: string;
  revenue: number;
  margin: number;
  margin_percentage: number;
}

interface ProductSalesEvolutionState {
  data: SalesDataItem[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook personnalisé pour récupérer l'évolution des ventes d'un produit spécifique
 */
export function useOneProductSalesEvolution(
  code13ref: string,
  interval: 'day' | 'week' | 'month' = 'day'
): ProductSalesEvolutionState {
  const [state, setState] = useState<ProductSalesEvolutionState>({
    data: [],
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate } = useDateRange();
  
  useEffect(() => {
    async function fetchProductSalesEvolution() {
      // Vérifier que les dates et le code produit sont disponibles
      if (!startDate || !endDate || !code13ref) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        // Construire les paramètres pour la requête
        const params = new URLSearchParams({
          startDate,
          endDate,
          interval
        });
        
        // Ajouter le code du produit
        params.append('code13refs', code13ref);
        
        // Effectuer la requête
        const response = await fetch(`/api/sales/evolution?${params}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des données');
        }
        
        const result = await response.json();
        
        setState({
          data: result.data || [],
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur dans useOneProductSalesEvolution:', error);
        setState({
          data: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
    
    fetchProductSalesEvolution();
  }, [code13ref, startDate, endDate, interval]);
  
  return state;
}