// src/utils/pharmacyApiUtils.ts
import apiClient from './apiUtils';
import { Pharmacy } from '@/contexts/PharmacyContext';

/**
 * Récupère la liste des pharmacies depuis l'API
 */
export const fetchPharmacies = async (): Promise<Pharmacy[]> => {
  try {
    const response = await apiClient.get('/api/pharmacies');
    return response.data.pharmacies || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des pharmacies:', error);
    throw error;
  }
};

/**
 * Récupère les données d'une pharmacie spécifique par son ID
 */
export const fetchPharmacyById = async (id: string): Promise<Pharmacy> => {
  try {
    const response = await apiClient.get(`/api/pharmacies/${id}`);
    return response.data.pharmacy;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la pharmacie ${id}:`, error);
    throw error;
  }
};

/**
 * Récupère les données de vente d'une pharmacie pour une période donnée
 */
export const fetchPharmacySales = async (
  pharmacyId: string, 
  startDate: string, 
  endDate: string
): Promise<any> => {
  try {
    const params = { startDate, endDate };
    const endpoint = pharmacyId === 'all' 
      ? '/api/sales' 
      : `/api/pharmacies/${pharmacyId}/sales`;
    
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des ventes:', error);
    throw error;
  }
};

/**
 * Récupère les données de stock d'une pharmacie
 */
export const fetchPharmacyInventory = async (
  pharmacyId: string,
  date: string
): Promise<any> => {
  try {
    const params = { date };
    const endpoint = pharmacyId === 'all' 
      ? '/api/inventory' 
      : `/api/pharmacies/${pharmacyId}/inventory`;
    
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des stocks:', error);
    throw error;
  }
};

/**
 * Récupère les produits les plus vendus pour une pharmacie
 */
export const fetchTopProducts = async (
  pharmacyId: string,
  startDate: string,
  endDate: string,
  limit: number = 10
): Promise<any> => {
  try {
    const params = { startDate, endDate, limit };
    const endpoint = pharmacyId === 'all' 
      ? '/api/products/top' 
      : `/api/pharmacies/${pharmacyId}/products/top`;
    
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits les plus vendus:', error);
    throw error;
  }
};

/**
 * Récupère la répartition des ventes par catégorie
 */
export const fetchSalesByCategory = async (
  pharmacyId: string,
  startDate: string,
  endDate: string
): Promise<any> => {
  try {
    const params = { startDate, endDate };
    const endpoint = pharmacyId === 'all' 
      ? '/api/sales/by-category' 
      : `/api/pharmacies/${pharmacyId}/sales/by-category`;
    
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des ventes par catégorie:', error);
    throw error;
  }
};