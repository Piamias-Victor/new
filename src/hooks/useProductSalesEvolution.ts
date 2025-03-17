// src/hooks/useProductSalesEvolution.ts
import { useState, useEffect } from 'react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { Product } from '@/services/productService';

interface SalesDataItem {
  period: string;
  quantity: number;
  revenue: number;
  margin: number;
  margin_percentage: number;
}

interface TotalDataItem {
  period: string;
  total_quantity: number;
  total_revenue: number;
  total_margin: number;
  margin_percentage: number;
}

interface ProductData {
  name: string;
  category: string;
  brand_lab: string;
  data: SalesDataItem[];
}

interface PharmacyData {
  name: string;
  data: SalesDataItem[];
}

interface ProductSalesEvolutionData {
  totalData: TotalDataItem[];
  productData: Record<string, ProductData>;
  pharmacyData: Record<string, PharmacyData>;
  isLoading: boolean;
  error: string | null;
}

export function useProductSalesEvolution(
  products: Product[],
  interval: 'day' | 'week' | 'month' = 'day'
): ProductSalesEvolutionData {
  const [data, setData] = useState<ProductSalesEvolutionData>({
    totalData: [],
    productData: {},
    pharmacyData: {},
    isLoading: true,
    error: null
  });
  
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  
  useEffect(() => {
    async function fetchSalesEvolution() {
      if (!startDate || !endDate || products.length === 0) {
        setData(prev => ({ 
          ...prev, 
          isLoading: false,
          totalData: [],
          productData: {},
          pharmacyData: {}
        }));
        return;
      }
      
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Préparer les paramètres de la requête
        const params = new URLSearchParams({
          startDate,
          endDate,
          interval
        });
        
        // Ajouter chaque ID de produit comme paramètre
        products.forEach(product => {
          params.append('productIds', product.id);
        });
        
        // Ajouter les IDs de pharmacie si spécifiés
        if (selectedPharmacyIds.length > 0) {
          selectedPharmacyIds.forEach(id => {
            params.append('pharmacyIds', id);
          });
        }
        
        // Effectuer la requête
        const response = await fetch(`/api/products/sales-evolution?${params}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des données');
        }
        
        const result = await response.json();
        
        setData({
          totalData: result.totalData || [],
          productData: result.productData || {},
          pharmacyData: result.pharmacyData || {},
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur dans useProductSalesEvolution:', error);
        setData({
          totalData: [],
          productData: {},
          pharmacyData: {},
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
    
    fetchSalesEvolution();
  }, [startDate, endDate, products, interval, selectedPharmacyIds]);
  
  return data;
}