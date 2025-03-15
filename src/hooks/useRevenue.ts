// src/hooks/useRevenue.ts - version mise à jour
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

interface RevenueEvolution {
  absolute: number;
  percentage: number;
  isPositive: boolean;
}

interface Evolution {
  revenue: RevenueEvolution;
  margin: RevenueEvolution;
  marginPercentage: RevenueEvolution;
}

interface RevenueData {
  totalRevenue: number;
  totalMargin: number;
  marginPercentage: number;
  isLoading: boolean;
  error: string | null;
  actualDateRange?: {
    min: string;
    max: string;
    days: number;
  };
  comparison?: {
    totalRevenue: number;
    totalMargin: number;
    marginPercentage: number;
    evolution: Evolution;
    actualDateRange?: {
      min: string;
      max: string;
      days: number;
    };
  };
}

export function useRevenue(): RevenueData {
  const [data, setData] = useState<RevenueData>({
    totalRevenue: 0,
    totalMargin: 0,
    marginPercentage: 0,
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate, comparisonStartDate, comparisonEndDate, isComparisonEnabled } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  
  // Fonction pour récupérer les données de revenue et de marge
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
        endDate
      });
      
      // Ajouter les dates de comparaison si activées
      if (isComparisonEnabled && comparisonStartDate && comparisonEndDate) {
        params.append('comparisonStartDate', comparisonStartDate);
        params.append('comparisonEndDate', comparisonEndDate);
      }
      
      // Si on a une sélection spécifique, on l'ajoute aux paramètres
      if (selectedPharmacyIds.length > 0) {
        // Ajouter chaque ID de pharmacie sélectionnée
        selectedPharmacyIds.forEach(id => {
          params.append('pharmacyIds', id);
        });
      }
      
      // Effectuer la requête
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
      
      // Mettre à jour l'état avec les données reçues
      setData({
        totalRevenue: result.totalRevenue,
        totalMargin: result.totalMargin,
        marginPercentage: result.marginPercentage,
        actualDateRange: result.actualDateRange,
        comparison: result.comparison,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Erreur dans useRevenue:', error);
      setData({
        totalRevenue: 0,
        totalMargin: 0,
        marginPercentage: 0,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };
  
  // Déclencher la requête lorsque les dépendances changent
  useEffect(() => {
    fetchRevenue();
  }, [startDate, endDate, comparisonStartDate, comparisonEndDate, selectedPharmacyIds, isComparisonEnabled]);
  
  return data;
}