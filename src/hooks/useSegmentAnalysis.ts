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
    category: string;
    total_revenue: number;
  };
  selectedLabProductsTop: TopProduct[];
  otherLabsProductsTop: TopProduct[];
  marketShareByLab: LaboratoryMarketShare[];
  isLoading: boolean;
  error: string | null;
}

export function useSegmentAnalysis(segmentId: string, laboratoryId: string): SegmentAnalysisData {
  console.log(`\n\n================ HOOK useSegmentAnalysis ================`);
  console.log(`segmentId: "${segmentId}", laboratoryId: "${laboratoryId}"`);
  
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
  
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  
  useEffect(() => {
    async function fetchSegmentAnalysis() {
      console.log(`HOOK EFFECT - startDate: ${startDate}, endDate: ${endDate}`);
      if (!segmentId || !laboratoryId || !startDate || !endDate) {
        console.log("HOOK - Paramètres manquants, pas d'appel API");
        return;
      }
      
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      console.log("HOOK - État de chargement activé");
      
      try {
        // Déterminer le type de segment et sa valeur
        let segmentType = 'category';
        let segmentValue = '';
        
        if (segmentId.startsWith('universe_')) {
          // C'est un segment de type univers
          segmentType = 'universe';
          segmentValue = segmentId.substring(9); // Enlever "universe_"
          console.log(`HOOK - Type: univers, Valeur: "${segmentValue}"`);
        } else {
          // C'est un segment de type catégorie
          const parts = segmentId.split('_');
          if (parts.length >= 2) {
            segmentValue = parts.slice(1).join('_'); // Le nom de la catégorie
            console.log(`HOOK - Type: catégorie, Univers: "${parts[0]}", Valeur: "${segmentValue}"`);
          } else {
            // Format invalide
            console.log("HOOK - ERREUR: Format de segmentId invalide");
            throw new Error('Format de segmentId invalide');
          }
        }
        
        // Préparer le corps de la requête avec les nouvelles propriétés
        const requestBody = {
          startDate,
          endDate,
          laboratoryId,
          pharmacyIds: selectedPharmacyIds.length > 0 ? selectedPharmacyIds : [],
          limit: 10,
          segmentType, // Nouveau: type de segment explicite
          segmentValue // Nouveau: valeur du segment
        };
        
        console.log("HOOK - Corps de la requête:", JSON.stringify(requestBody));
        
        // Effectuer la requête POST
        console.log(`HOOK - Appel API: /api/segments/${segmentId}/analysis`);
        const response = await fetch(`/api/segments/${segmentId}/analysis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.log(`HOOK - Erreur API: ${response.status}`, errorData);
          throw new Error(errorData.error || 'Erreur lors de la récupération des données');
        }
        
        const result = await response.json();
        console.log("HOOK - Réponse API reçue:", JSON.stringify(result.segmentInfo));
        
        // Vérifier que les données sont conformes à nos attentes
        const segmentInfo = result.segmentInfo || {
          id: segmentId,
          name: '',
          universe: '',
          category: '',
          total_revenue: 0
        };
        
        const selectedLabProductsTop = Array.isArray(result.selectedLabProductsTop) 
          ? result.selectedLabProductsTop 
          : [];
          
        const otherLabsProductsTop = Array.isArray(result.otherLabsProductsTop)
          ? result.otherLabsProductsTop
          : [];
          
        const marketShareByLab = Array.isArray(result.marketShareByLab)
          ? result.marketShareByLab
          : [];
        
        console.log('HOOK - segmentInfo reçu:', JSON.stringify(segmentInfo));
        console.log(`HOOK - segmentInfo.universe: "${segmentInfo.universe}", segmentInfo.category: "${segmentInfo.category}"`);
        console.log('HOOK - selectedLabProductsTop:', selectedLabProductsTop.length);
        console.log('HOOK - otherLabsProductsTop:', otherLabsProductsTop.length);
        console.log('HOOK - marketShareByLab:', marketShareByLab.length);
        
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
      console.log(`================ FIN HOOK useSegmentAnalysis ================\n\n`);
    }
    
    fetchSegmentAnalysis();
  }, [segmentId, laboratoryId, startDate, endDate, selectedPharmacyIds]);
  
  return data;
}