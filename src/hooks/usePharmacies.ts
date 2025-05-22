// src/hooks/usePharmacies.ts
import { useState, useEffect, useCallback } from 'react';

export interface Pharmacy {
  id: string;
  name: string | null;
  ca: number | null;
  area: string | null;
  employees_count: number | null;
  address: string | null;
  id_nat: string | null;
}

export function usePharmacies() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fonction pour charger les pharmacies avec force refresh
  const loadPharmacies = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const timestamp = Date.now();
      console.log('🔄 Rechargement des pharmacies...', { 
        forceRefresh, 
        timestamp 
      });
      
      const url = forceRefresh 
        ? `/api/admin/pharmacies?_force=${timestamp}&_t=${timestamp}`
        : `/api/admin/pharmacies?_t=${timestamp}`;
      
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des pharmacies');
      }
      
      const data = await response.json();
      setPharmacies(data.pharmacies || []);
      console.log('✅ Pharmacies rechargées:', {
        count: data.pharmacies?.length || 0,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('❌ Erreur lors du rechargement des pharmacies:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Charger les pharmacies au montage du composant
  useEffect(() => {
    loadPharmacies();
  }, [loadPharmacies]);
  
  // Fonction pour obtenir une pharmacie spécifique
  const getPharmacy = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/pharmacies/${id}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la pharmacie');
      }
      
      const data = await response.json();
      return data.pharmacy;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour mettre à jour une pharmacie
  const updatePharmacy = async (id: string, pharmacyData: Partial<Pharmacy>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/pharmacies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pharmacyData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour de la pharmacie');
      }
      
      const data = await response.json();
      
      // Mettre à jour la liste des pharmacies
      setPharmacies(prev => 
        prev.map(p => p.id === id ? { ...p, ...data.pharmacy } : p)
      );
      
      return data.pharmacy;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    pharmacies,
    isLoading,
    error,
    loadPharmacies,
    getPharmacy,
    updatePharmacy
  };
}