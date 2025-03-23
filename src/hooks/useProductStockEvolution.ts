// src/hooks/useProductStockEvolution.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

export interface StockDataItem {
  period: string;
  stock: number;
  value: number;
  rupture_quantity: number;
  is_rupture: boolean;
}

interface ProductStockEvolutionState {
  data: StockDataItem[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook personnalisé pour récupérer l'évolution du stock d'un produit spécifique
 */
export function useProductStockEvolution(
  code13ref: string,
  interval: 'day' | 'week' | 'month' = 'day'
): ProductStockEvolutionState {
  const [state, setState] = useState<ProductStockEvolutionState>({
    data: [],
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  
  useEffect(() => {
    async function fetchProductStockEvolution() {
      // Vérifier que les dates et le code produit sont disponibles
      if (!startDate || !endDate || !code13ref) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        // Construire la requête POST avec les paramètres
        const response = await fetch('/api/products/stock-evolution', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code13ref,
            startDate,
            endDate,
            interval,
            pharmacyIds: selectedPharmacyIds
          }),
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des données de stock');
        }
        
        const result = await response.json();
        
        setState({
          data: result.data || [],
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur dans useProductStockEvolution:', error);
        setState({
          data: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
    
    fetchProductStockEvolution();
  }, [code13ref, startDate, endDate, interval, selectedPharmacyIds]);
  
  return state;
}