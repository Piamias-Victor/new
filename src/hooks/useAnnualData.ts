// src/hooks/useAnnualData.ts
import { useState, useEffect, useRef } from 'react';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { useDataLoading } from '@/contexts/DataLoadingContext';

export interface AnnualData {
  // Données actuelles
  sellOutRevenue: number;
  sellInRevenue: number;
  // Données de l'année dernière pour la même période
  previousYearSellOut: number;
  previousYearSellIn: number;
  // Pourcentage du temps écoulé dans l'année
  yearProgressPercentage: number;
  // Données annuelles complètes de l'année précédente
  lastYearTotal: {
    sellOut: number;
    sellIn: number;
  };
  // Mois écoulés dans l'année en cours
  elapsedMonths: number;
  // Mois restants dans l'année en cours
  remainingMonths: number;
  // Statut du chargement
  isLoading: boolean;
  error: string | null;
}

export function useAnnualData(): AnnualData {
  const [data, setData] = useState<AnnualData>({
    sellOutRevenue: 0,
    sellInRevenue: 0,
    previousYearSellOut: 0,
    previousYearSellIn: 0,
    yearProgressPercentage: 0,
    lastYearTotal: {
      sellOut: 0,
      sellIn: 0
    },
    elapsedMonths: 0,
    remainingMonths: 0,
    isLoading: false,
    error: null
  });
  
  // Contextes
  const { selectedPharmacyIds } = usePharmacySelection();
  const { selectedCodes, isFilterActive } = useProductFilter();
  const { isReadyToLoad, createAbortSignal, incrementActiveRequests, decrementActiveRequests } = useDataLoading();
  
  // Référence pour éviter les appels multiples
  const isLoadingRef = useRef(false);
  
  useEffect(() => {
    // Ne se déclenche QUE si isReadyToLoad est true
    if (!isReadyToLoad) {
      return;
    }
    
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) {
      console.log('🔍 useAnnualData: Chargement déjà en cours, ignoré');
      return;
    }
    
    fetchAnnualData();
  }, [isReadyToLoad]); // IMPORTANT: Ne dépend QUE de isReadyToLoad
  
  const fetchAnnualData = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    incrementActiveRequests();
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    console.log('🔍 useAnnualData: Début du chargement des données annuelles');
    
    try {
      const abortSignal = createAbortSignal();
      
      // Obtenir la date actuelle
      const now = new Date();
      const currentYear = now.getFullYear();
      
      // Calculer le début de l'année en cours
      const startOfYear = `${currentYear}-01-01`;
      
      // Format de la date actuelle en YYYY-MM-DD
      const currentDate = now.toISOString().split('T')[0];
      
      // Calculer le pourcentage de l'année écoulée
      const startOfYearDate = new Date(startOfYear);
      const endOfYear = new Date(currentYear, 11, 31); // 31 décembre
      
      const totalMillisInYear = endOfYear.getTime() - startOfYearDate.getTime();
      const elapsedMillis = now.getTime() - startOfYearDate.getTime();
      const yearProgressPercentage = (elapsedMillis / totalMillisInYear) * 100;
      
      // Calculer les mois écoulés et restants
      const elapsedMonths = now.getMonth() + 1; // getMonth() est 0-indexé
      const remainingMonths = 12 - elapsedMonths;
      
      // Utiliser POST pour récupérer les données
      const response = await fetch('/api/annual-projection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentYear,
          pharmacyIds: selectedPharmacyIds.length > 0 ? selectedPharmacyIds : [],
          code13refs: isFilterActive ? selectedCodes : []
        }),
        cache: 'no-store',
        signal: abortSignal
      });
      
      // Vérifier si la requête a été annulée
      if (abortSignal.aborted) {
        console.log('🔍 useAnnualData: Requête annulée');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données annuelles');
      }
      
      const result = await response.json();
      
      setData({
        sellOutRevenue: result.currentYear.sellOut || 0,
        sellInRevenue: result.currentYear.sellIn || 0,
        previousYearSellOut: result.previousYearSameTime.sellOut || 0,
        previousYearSellIn: result.previousYearSameTime.sellIn || 0,
        yearProgressPercentage: parseFloat(yearProgressPercentage.toFixed(1)),
        lastYearTotal: {
          sellOut: result.previousYearTotal.sellOut || 0,
          sellIn: result.previousYearTotal.sellIn || 0
        },
        elapsedMonths,
        remainingMonths,
        isLoading: false,
        error: null
      });
      
      console.log('✅ useAnnualData: Données annuelles chargées avec succès');
      
    } catch (error) {
      // Ne pas traiter l'erreur si la requête a été annulée
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🔍 useAnnualData: Requête annulée par AbortController');
        return;
      }
      
      console.error('❌ useAnnualData: Erreur lors de la récupération des données annuelles:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }));
      
      // En développement, utiliser des données fictives
      const now = new Date();
      const currentYear = now.getFullYear();
      const startOfYear = new Date(currentYear, 0, 1);
      const endOfYear = new Date(currentYear, 11, 31);
      const totalMillisInYear = endOfYear.getTime() - startOfYear.getTime();
      const elapsedMillis = now.getTime() - startOfYear.getTime();
      const yearProgressPercentage = (elapsedMillis / totalMillisInYear) * 100;
      const elapsedMonths = now.getMonth() + 1;
      const remainingMonths = 12 - elapsedMonths;
      
      setData({
        sellOutRevenue: 850000,
        sellInRevenue: 620000,
        previousYearSellOut: 800000,
        previousYearSellIn: 580000,
        yearProgressPercentage: parseFloat(yearProgressPercentage.toFixed(1)),
        lastYearTotal: {
          sellOut: 1200000,
          sellIn: 900000
        },
        elapsedMonths,
        remainingMonths,
        isLoading: false,
        error: null
      });
    } finally {
      isLoadingRef.current = false;
      decrementActiveRequests();
    }
  };
  
  return data;
}