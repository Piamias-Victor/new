// src/hooks/useSegmentAnalysis.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

export interface TopProduct {
  id: string;
  product_id: string;
  name: string;
  display_name: string;
  code_13_ref: string;
  brand_lab: string;
  total_quantity: number;
  total_revenue: number;
  total_margin: number;
  margin_percentage: number;
  current_stock?: number;
}

export interface LaboratoryMarketShare {
  id: string;
  name: string;
  total_revenue: number;
  market_share: number;
  product_count: number;
  rank: number;
}

export interface SegmentAnalysisData {
  segmentInfo: {
    id: string;
    name: string;
    universe: string;
    category?: string;
    family?: string;
    total_revenue: number;
  };
  selectedLabProductsTop: TopProduct[];
  otherLabsProductsTop: TopProduct[];
  marketShareByLab: LaboratoryMarketShare[];
  isLoading: boolean;
  error: string | null;
}

export function useSegmentAnalysis(segmentId: string, laboratoryId: string): SegmentAnalysisData {
  console.log(`\n\n========== HOOK useSegmentAnalysis (MISE À JOUR) ==========`);
  console.log(`segmentId: "${segmentId}", laboratoryId: "${laboratoryId}"`);
  
  // État local pour les données
  const [data, setData] = useState<SegmentAnalysisData>({
    segmentInfo: {
      id: '',
      name: '',
      universe: '',
      category: '',
      total_revenue: 0
    },
    selectedLabProductsTop: [],
    otherLabsProductsTop: [],
    marketShareByLab: [],
    isLoading: true,
    error: null
  });
  
  // Hooks pour les dates et pharmacies
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  
  useEffect(() => {
    async function fetchData() {
      // Vérification des paramètres requis
      if (!segmentId || !startDate || !endDate) {
        console.log("HOOK - Paramètres manquants, pas d'appel API");
        return;
      }
      
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      console.log("HOOK - État de chargement activé");
      
      try {
        // Découper le segmentId pour en extraire les parties
        const parts = segmentId.split('_');
        let response;
        
        // Cas spécial: segmentId commence par "family_"
        if (segmentId.startsWith('family_')) {
          // C'est une famille directe, sans univers ni catégorie spécifiés
          const family = segmentId.substring(7); // Enlever "family_"
          
          // Utiliser des valeurs par défaut pour univers/catégorie
          // puisque nous n'avons que la famille
          const universe = "default";
          const category = "default";
          
          console.log(`HOOK - Détection de famille directe: famille="${family}"`);
          console.log(`HOOK - Appel API famille: /api/family/${encodeURIComponent(universe)}/${encodeURIComponent(category)}/${encodeURIComponent(family)}/analysis`);
          
          response = await fetch(`/api/family/${encodeURIComponent(universe)}/${encodeURIComponent(category)}/${encodeURIComponent(family)}/analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              startDate,
              endDate,
              laboratoryId,
              pharmacyIds: selectedPharmacyIds
            }),
            cache: 'no-store'
          });
        } else if (parts.length >= 3) {
          // Format: "universe_category_family"
          // C'est un segment de type famille avec univers et catégorie spécifiés
          const universe = parts[0];
          const category = parts[1];
          const family = parts.slice(2).join('_'); // Prend en compte les noms avec underscores
          
          console.log(`HOOK - Détection de famille: univers="${universe}", catégorie="${category}", famille="${family}"`);
          console.log(`HOOK - Appel API famille: /api/family/${encodeURIComponent(universe)}/${encodeURIComponent(category)}/${encodeURIComponent(family)}/analysis`);
          
          response = await fetch(`/api/family/${encodeURIComponent(universe)}/${encodeURIComponent(category)}/${encodeURIComponent(family)}/analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              startDate,
              endDate,
              laboratoryId,
              pharmacyIds: selectedPharmacyIds
            }),
            cache: 'no-store'
          });
        } else if (parts.length === 2) {
          // Format: "universe_category"
          // C'est un segment de type catégorie
          const universe = parts[0];
          const category = parts[1];
          
          console.log(`HOOK - Détection de catégorie: univers="${universe}", catégorie="${category}"`);
          console.log(`HOOK - Appel API catégorie: /api/category/${encodeURIComponent(universe)}/${encodeURIComponent(category)}/analysis`);
          
          response = await fetch(`/api/category/${encodeURIComponent(universe)}/${encodeURIComponent(category)}/analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              startDate,
              endDate,
              laboratoryId,
              pharmacyIds: selectedPharmacyIds
            }),
            cache: 'no-store'
          });
        } else {
          // Format: "universe_VALUE" ou autre format spécial
          // C'est un segment de type univers
          const universe = parts[0].replace('universe_', '');
          
          console.log(`HOOK - Détection d'univers: univers="${universe}"`);
          console.log(`HOOK - Appel API univers: /api/universe/${encodeURIComponent(universe)}/analysis`);
          
          response = await fetch(`/api/universe/${encodeURIComponent(universe)}/analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              startDate,
              endDate,
              laboratoryId,
              pharmacyIds: selectedPharmacyIds
            }),
            cache: 'no-store'
          });
        }
        
        // Vérification de la réponse
        if (!response.ok) {
          const errorData = await response.json();
          console.log(`HOOK - Erreur API: ${response.status}`, errorData);
          throw new Error(errorData.error || 'Erreur lors de la récupération des données');
        }
        
        // Traitement de la réponse
        const result = await response.json();
        console.log("HOOK - Réponse API reçue:", JSON.stringify(result.segmentInfo));
        
        // Extraction des données
        const segmentInfo = result.segmentInfo || {
          id: segmentId,
          name: '',
          universe: '',
          category: '',
          family: '',
          total_revenue: 0
        };
        
        // Conversion du revenu en nombre si c'est une chaîne
        if (typeof segmentInfo.total_revenue === 'string') {
          segmentInfo.total_revenue = parseFloat(segmentInfo.total_revenue);
        }
        
        const selectedLabProductsTop = Array.isArray(result.selectedLabProductsTop) 
          ? result.selectedLabProductsTop 
          : [];
          
        const otherLabsProductsTop = Array.isArray(result.otherLabsProductsTop)
          ? result.otherLabsProductsTop
          : [];
          
        const marketShareByLab = Array.isArray(result.marketShareByLab)
          ? result.marketShareByLab
          : [];
        
        // Mise à jour de l'état avec les données traitées
        const newData = {
          segmentInfo,
          selectedLabProductsTop,
          otherLabsProductsTop,
          marketShareByLab,
          isLoading: false,
          error: null
        };
        
        console.log("HOOK - Mise à jour des données:", JSON.stringify(newData.segmentInfo));
        setData(newData);
        console.log("HOOK - Données mises à jour");
      } catch (error) {
        console.error('HOOK - Erreur dans useSegmentAnalysis:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }));
        console.log("HOOK - État d'erreur défini");
      }
      
      console.log(`========== FIN HOOK useSegmentAnalysis (MISE À JOUR) ==========\n\n`);
    }
    
    fetchData();
  }, [segmentId, laboratoryId, startDate, endDate, selectedPharmacyIds]);
  
  return data;
}