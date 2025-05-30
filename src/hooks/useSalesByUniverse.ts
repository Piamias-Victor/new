import { useDateRange } from "@/contexts/DateRangeContext";
import { usePharmacySelection } from "@/providers/PharmacyProvider";
import { useDataLoading } from "@/contexts/DataLoadingContext";
import { useState, useEffect, useRef } from "react";

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
    isLoading: false,
    error: null
  });
  
  // Contextes
  const { startDate, endDate } = useDateRange();
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
    if (!startDate || !endDate) {
      console.log('🔍 useSalesByUniverse: Dates manquantes, pas de chargement');
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useSalesByUniverse: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchSalesByUniverse();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchSalesByUniverse = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useSalesByUniverse: Début du chargement des ventes par univers');
    
    try {
      const abortSignal = createAbortSignal();
      
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
        cache: 'no-store',
        signal: abortSignal
      });
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useSalesByUniverse: Requête annulée');
        return;
      }
      
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
      
      console.log('✅ useSalesByUniverse: Ventes par univers chargées avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useSalesByUniverse: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useSalesByUniverse: Erreur lors de la récupération des données:', error);
      setData({
        data: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      isLoadingRef.current = false;
      decrementActiveRequests();
    }
  };
  
  return data;
}