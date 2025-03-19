// src/hooks/useRevenue.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

interface RevenueEvolution {
  absolute: number;
  percentage: number;
  isPositive: boolean;
}

interface MarginPercentageEvolution {
  points: number;      // Différence en points de pourcentage
  isPositive: boolean;
}

interface Evolution {
  revenue: RevenueEvolution;
  margin: RevenueEvolution;
  quantity: RevenueEvolution;  // Nouvelle propriété pour les quantités
  uniqueProducts: RevenueEvolution; // Nouvelle propriété pour les produits uniques
  marginPercentage: MarginPercentageEvolution;
}

interface RevenueData {
  totalRevenue: number;
  totalMargin: number;
  totalQuantity: number;  // Nouvelle propriété ajoutée
  totalUniqueSoldProducts: number;
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
    totalQuantity: number;  // Nouvelle propriété ajoutée
    totalUniqueSoldProducts: number;
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
    totalQuantity: 0,
    totalUniqueSoldProducts: 0,
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
      
      // Préparer les données pour la requête POST
      const requestData = {
        startDate,
        endDate,
        // Ajouter les dates de comparaison si activées
        ...(isComparisonEnabled && comparisonStartDate && comparisonEndDate && {
          comparisonStartDate,
          comparisonEndDate
        }),
        // Ajouter les IDs de pharmacie sélectionnées
        pharmacyIds: selectedPharmacyIds
      };
      
      // Effectuer la requête POST
      const response = await fetch('/api/sales/revenue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        cache: 'no-store'
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
        totalQuantity: result.totalQuantity,
        totalUniqueSoldProducts: result.totalUniqueSoldProducts || 0,
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
        totalQuantity: 0,
        totalUniqueSoldProducts: 0,
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