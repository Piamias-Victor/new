// src/services/productService.ts
import apiClient from '@/utils/apiUtils';

export interface Product {
  id: string;
  product_id: string;
  name: string;
  display_name: string;
  ean: string;
  code_13_ref: string;
  category?: string;
  brand_lab?: string;
  current_stock?: number;
  price_with_tax?: number;
  weighted_average_price?: number;
  tva_rate?: number;
}

export interface SearchParams {
  term: string;
  type: 'name' | 'code' | 'suffix' | 'list';
  pharmacyIds?: string[];
  limit?: number;
}

export interface ProductDetailsParams {
  productId: string;
  startDate?: string;
  endDate?: string;
  pharmacyIds?: string[];
}

/**
 * Service pour gérer les opérations liées aux produits
 */
export const productService = {
  /**
   * Rechercher des produits selon différents critères
   */
  // src/services/productService.ts - Méthode searchProducts modifiée
searchProducts: async (params: SearchParams): Promise<Product[]> => {
  try {
    // Construire les paramètres de la requête
    const queryParams = new URLSearchParams();
    
    if (params.type === 'name') {
      queryParams.append('name', params.term);
    } else if (params.type === 'code') {
      queryParams.append('code', params.term);
    } else if (params.type === 'suffix') {
      queryParams.append('suffix', params.term.replace(/^\*+/, ''));
    } else if (params.type === 'list') {
      // Diviser la liste et ajouter chaque code comme paramètre séparé
      const codes = params.term
        .split(/[\n,;]/)
        .map(code => code.trim())
        .filter(Boolean);
      
      codes.forEach(code => {
        queryParams.append('codes', code);
      });
    }
    
    // Ajouter les pharmacies si spécifiées
    if (params.pharmacyIds && params.pharmacyIds.length > 0) {
      params.pharmacyIds.forEach(id => {
        queryParams.append('pharmacyIds', id);
      });
    }
    
    // Ajouter la limite si spécifiée
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    
    // Utiliser fetch au lieu d'axios pour les routes API internes
    const response = await fetch(`/api/products/search?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Erreur lors de la recherche de produits:', error);
    throw error;
  }
},
  
  /**
   * Obtenir les détails d'un produit spécifique
   */
  getProductDetails: async (params: ProductDetailsParams): Promise<any> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      
      if (params.pharmacyIds && params.pharmacyIds.length > 0) {
        params.pharmacyIds.forEach(id => {
          queryParams.append('pharmacyIds', id);
        });
      }
      
      const response = await apiClient.get(`/api/products/${params.productId}?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des détails du produit ${params.productId}:`, error);
      throw error;
    }
  },
  
  /**
   * Obtenir l'historique des ventes d'un produit
   */
  getProductSalesHistory: async (productId: string, params: any): Promise<any> => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await apiClient.get(`/api/products/${productId}/sales?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'historique des ventes du produit ${productId}:`, error);
      throw error;
    }
  },
  
  /**
   * Obtenir l'historique des stocks d'un produit
   */
  getProductStockHistory: async (productId: string, params: any): Promise<any> => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await apiClient.get(`/api/products/${productId}/stock?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'historique des stocks du produit ${productId}:`, error);
      throw error;
    }
  }
};

export default productService;