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
      if (!segmentId || !laboratoryId || !startDate || !endDate) {
        console.log("HOOK - Paramètres manquants, pas d'appel API");
        return;
      }
      
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      console.log("HOOK - État de chargement activé");
      
      try {
        // Déterminer le type de segment (univers, catégorie ou famille)
        let segmentType: 'universe' | 'category' | 'family' = 'category';
        
        // Analyse de segmentId
        if (segmentId.startsWith('universe_')) {
          segmentType = 'universe';
        } else {
          // Compter le nombre de segments "_" pour déterminer s'il s'agit d'une catégorie ou d'une famille
          const parts = segmentId.split('_');
          if (parts.length === 2) {
            segmentType = 'category';
          } else if (parts.length >= 3) {
            segmentType = 'family';
          }
        }
        
        console.log(`HOOK - Type de segment identifié: ${segmentType}`);
        
        // Préparation des paramètres de requête communs
        const commonParams = {
          startDate,
          endDate,
          laboratoryId,
          pharmacyIds: selectedPharmacyIds.length > 0 ? selectedPharmacyIds : [],
          limit: 10
        };
        
        let response;
        
        if (segmentType === 'universe') {
          // APPEL API UNIVERS
          // Extraction de l'univers: "universe_DERMOCOSMETIQUE" -> "DERMOCOSMETIQUE"
          const universeValue = segmentId.substring(9);
          console.log(`HOOK - Valeur de l'univers: "${universeValue}"`);
          
          console.log(`HOOK - Appel API univers: /api/universe/${encodeURIComponent(universeValue)}/analysis`);
          response = await fetch(`/api/universe/${encodeURIComponent(universeValue)}/analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(commonParams),
            cache: 'no-store'
          });
        } else if (segmentType === 'category') {
          // APPEL API CATÉGORIE
          // Extraction de l'univers et de la catégorie: "MEDICAMENT_DOULEUR" -> ["MEDICAMENT", "DOULEUR"]
          const parts = segmentId.split('_');
          if (parts.length < 2) {
            throw new Error('Format de segmentId invalide pour une catégorie');
          }
          
          const universe = parts[0];
          const category = parts[1];
          
          console.log(`HOOK - Univers: "${universe}", Catégorie: "${category}"`);
          console.log(`HOOK - Appel API catégorie: /api/category/${encodeURIComponent(universe)}/${encodeURIComponent(category)}/analysis`);
          
          response = await fetch(`/api/category/${encodeURIComponent(universe)}/${encodeURIComponent(category)}/analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(commonParams),
            cache: 'no-store'
          });
        } else {
          // APPEL API FAMILLE
          // Extraction de l'univers, de la catégorie et de la famille: "MEDICAMENT_DOULEUR_TETE" -> ["MEDICAMENT", "DOULEUR", "TETE"]
          const parts = segmentId.split('_');
          if (parts.length < 3) {
            throw new Error('Format de segmentId invalide pour une famille');
          }
          
          const universe = parts[0];
          const category = parts[1];
          const family = parts.slice(2).join('_'); // Au cas où le nom de famille contiendrait des underscores
          
          console.log(`HOOK - Univers: "${universe}", Catégorie: "${category}", Famille: "${family}"`);
          console.log(`HOOK - Appel API famille: /api/family/${encodeURIComponent(universe)}/${encodeURIComponent(category)}/${encodeURIComponent(family)}/analysis`);
          
          response = await fetch(`/api/family/${encodeURIComponent(universe)}/${encodeURIComponent(category)}/${encodeURIComponent(family)}/analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(commonParams),
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