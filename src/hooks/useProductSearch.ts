// src/hooks/useProductSearch.ts
import { useState, useCallback } from 'react';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import productService, { Product, SearchParams } from '@/services/productService';

interface UseProductSearchResult {
  results: Product[];
  isLoading: boolean;
  error: string | null;
  searchProducts: (params: Omit<SearchParams, 'pharmacyIds'>) => Promise<void>;
  clearResults: () => void;
}

/**
 * Hook personnalisé pour la recherche de produits
 */
export function useProductSearch(initialLimit = 20): UseProductSearchResult {
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Récupérer les pharmacies sélectionnées
  const { selectedPharmacyIds } = usePharmacySelection();
  
  // Fonction pour effectuer la recherche
  const searchProducts = useCallback(async (params: Omit<SearchParams, 'pharmacyIds'>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Préparer les paramètres de recherche avec les pharmacies sélectionnées
      const searchParams: SearchParams = {
        ...params,
        pharmacyIds: selectedPharmacyIds,
        limit: params.limit || initialLimit
      };
      
      console.log('Recherche avec les paramètres:', searchParams);
      
      // Appeler le service de recherche
      const data = await productService.searchProducts(searchParams);
      setResults(data);
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
      setError(err instanceof Error ? err.message : 'Erreur de recherche inconnue');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPharmacyIds, initialLimit]);
  
  // Fonction pour effacer les résultats
  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);
  
  return { 
    results, 
    isLoading, 
    error, 
    searchProducts,
    clearResults
  };
}

export default useProductSearch;