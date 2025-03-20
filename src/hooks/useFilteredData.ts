// src/hooks/useFilteredData.ts
import { useEffect, useState } from 'react';
import { useProductSelection } from '@/contexts/ProductSelectionContext';

/**
 * Hook qui filtre les données en fonction des codes EAN13 sélectionnés
 * @param data Les données à filtrer
 * @param getItemCode Fonction pour extraire le code EAN13 d'un élément
 * @returns Données filtrées en fonction de la sélection
 */
export function useFilteredData<T>(
  data: T[],
  getItemCode: (item: T) => string
): {
  filteredData: T[];
  isSelectionActive: boolean;
} {
  const { selectedCodes, selectionCount } = useProductSelection();
  const [filteredData, setFilteredData] = useState<T[]>(data);
  
  useEffect(() => {
    // Si aucune sélection, on retourne toutes les données
    if (selectionCount === 0 || selectedCodes.length === 0) {
      setFilteredData(data);
      return;
    }
    
    // Sinon, on filtre les données en fonction des codes sélectionnés
    const filtered = data.filter(item => {
      const itemCode = getItemCode(item);
      return selectedCodes.includes(itemCode);
    });
    
    setFilteredData(filtered);
  }, [data, selectedCodes, selectionCount, getItemCode]);
  
  return {
    filteredData,
    isSelectionActive: selectionCount > 0 && selectedCodes.length > 0
  };
}