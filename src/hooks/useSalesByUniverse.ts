import { useDateRange } from "@/contexts/DateRangeContext";
import { usePharmacySelection } from "@/providers/PharmacyProvider";
import { useState, useEffect } from "react";

// Define the SalesByUniverseData type
type SalesByUniverseData = {
  data: {
    universe: string;
    revenue: number;
    margin: number;
    quantity: number;
    revenue_percentage: number;
    margin_percentage: number;
  }[];
  isLoading: boolean;
  error: string | null;
};

// src/hooks/useSalesByUniverse.ts - Version améliorée
export function useSalesByUniverse(): SalesByUniverseData {
  const [data, setData] = useState<SalesByUniverseData>({
    data: [],
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  
  useEffect(() => {
    async function fetchSalesByUniverse() {
      // Vérifier que les dates sont disponibles
      if (!startDate || !endDate) {
        return;
      }
      
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Préparer les paramètres de la requête
        const params = new URLSearchParams({
          startDate,
          endDate
        });
        
        // Si on a une sélection spécifique, on l'ajoute aux paramètres
        if (selectedPharmacyIds.length > 0) {
          selectedPharmacyIds.forEach(id => {
            params.append('pharmacyIds', id);
          });
        }
        
        // Effectuer la requête
        const response = await fetch(`/api/sales/universe?${params}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des données');
        }
        
        const result = await response.json();
        
        // Assurer que tous les champs numériques sont bien des nombres
        const processedData = (result.data || []).map(item => ({
          universe: item.universe || "Autre",
          revenue: Number(item.revenue) || 0,
          margin: Number(item.margin) || 0,
          quantity: Number(item.quantity) || 0,
          revenue_percentage: Number(item.revenue_percentage) || 0,
          margin_percentage: Number(item.margin_percentage) || 0
        }));
        
        setData({
          data: processedData,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur dans useSalesByUniverse:', error);
        setData({
          data: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
    
    fetchSalesByUniverse();
  }, [startDate, endDate, selectedPharmacyIds]);
  
  return data;
}