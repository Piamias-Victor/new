// src/hooks/useProductInfo.ts
import { useState, useEffect } from 'react';

interface ProductInfo {
  id: string;
  name: string;
  code_13_ref: string;
  universe?: string;
  category?: string;
  sub_category?: string;
  family?: string;
  sub_family?: string;
  brand_lab?: string;
  range_name?: string;
  first_seen_date?: string;
  avg_monthly_rotation?: number;
}

export function useProductInfo(code13ref: string | null) {
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ne pas faire de requête si le code EAN n'est pas fourni
    if (!code13ref) {
      setProduct(null);
      setError(null);
      return;
    }

    async function fetchProductInfo() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products/${code13ref}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erreur ${response.status}`);
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des informations du produit:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProductInfo();
  }, [code13ref]);

  return { product, isLoading, error };
}