// src/hooks/useProductSearch.ts (mise à jour)
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

export function useProductSearch(initialLimit = 20): UseProductSearchResult {
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { selectedPharmacyIds } = usePharmacySelection();
  
  const searchProducts = useCallback(async (params: Omit<SearchParams, 'pharmacyIds'>) => {
    try {
      // Validation des paramètres
      if (!params.term || params.term.trim() === '') {
        setError('Veuillez entrer un terme de recherche');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      // Nettoyer le terme de recherche
      const cleanTerm = params.term.trim();
      
      // Préparer les paramètres de recherche avec les pharmacies sélectionnées
      const searchParams: SearchParams = {
        ...params,
        term: cleanTerm,
        pharmacyIds: selectedPharmacyIds,
        limit: params.limit || initialLimit
      };
      
      // Traitement spécial pour le mode liste
      if (params.type === 'list') {
        // Vérifier s'il y a du contenu après nettoyage
        const codes = cleanTerm.split(/[\n,;]/).map(code => code.trim()).filter(Boolean);
        if (codes.length === 0) {
          setError('Veuillez entrer au moins un code valide');
          setIsLoading(false);
          return;
        }
      }
      
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