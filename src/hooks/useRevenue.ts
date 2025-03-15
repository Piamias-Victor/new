// src/hooks/useRevenue.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacy } from '@/contexts/PharmacyContext';

interface RevenueData {
  totalRevenue: number;
  isLoading: boolean;
  error: string | null;
  actualDateRange?: {
    min: string;
    max: string;
    days: number;
  };
}

export function useRevenue(): RevenueData {
  const [data, setData] = useState<RevenueData>({
    totalRevenue: 0,
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyId } = usePharmacy();
  
  // Fonction pour récupérer les données de revenue
  const fetchRevenue = async () => {
    // Vérifier que les dates sont disponibles
    if (!startDate || !endDate) {
      return;
    }
    
    try {
      // Mettre à jour l'état pour indiquer le chargement
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Préparer les paramètres de la requête
      const params = new URLSearchParams({
        startDate,
        endDate,
        pharmacyId: selectedPharmacyId
      });
      
      console.log(`Fetching revenue data for pharmacy: ${selectedPharmacyId}, period: ${startDate} to ${endDate}`);
      
      // Effectuer la requête avec cache: 'no-store' pour éviter les problèmes de cache
      const response = await fetch(`/api/sales/revenue?${params}`, {
        cache: 'no-store',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des données');
      }
      
      const result = await response.json();
      console.log('Revenue data received:', result);
      
      // Mettre à jour l'état avec les données reçues
      setData({
        totalRevenue: result.totalRevenue,
        actualDateRange: result.actualDateRange,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Erreur dans useRevenue:', error);
      setData({
        totalRevenue: 0,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };
  
  // Déclencher la requête lorsque les dépendances changent
  useEffect(() => {
    fetchRevenue();
  }, [startDate, endDate, selectedPharmacyId]);
  
  return data;
}