// src/hooks/useFilteredByEan.ts
'use client';

import { useMemo } from 'react';
import { useProductFilter } from '@/contexts/ProductFilterContext';

/**
 * Hook qui filtre un tableau de données en fonction des codes EAN13 sélectionnés
 * @param data Le tableau de données à filtrer
 * @param getEanCode Fonction pour extraire le code EAN13 d'un élément
 * @returns Données filtrées et état du filtre
 */
export function useFilteredByEan<T>(
  data: T[] | undefined,
  getEanCode: (item: T) => string
) {
  const { selectedCodes, isFilterActive } = useProductFilter();
  
  // Filtrer les données si nécessaire
  const filteredData = useMemo(() => {
    // Si aucun filtre actif ou pas de données, retourner les données telles quelles
    if (!isFilterActive || !selectedCodes.length || !data || !data.length) {
      return data || [];
    }
    
    // Sinon, filtrer les données par code EAN13
    return data.filter(item => {
      const eanCode = getEanCode(item);
      return eanCode && selectedCodes.includes(eanCode);
    });
  }, [data, selectedCodes, isFilterActive, getEanCode]);
  
  return {
    data: filteredData,
    isFiltered: isFilterActive && data?.length !== filteredData.length,
    filteredCount: filteredData.length,
    totalCount: data?.length || 0
  };
}