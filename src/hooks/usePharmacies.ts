// src/hooks/usePharmacies.ts
import { useState, useEffect } from 'react';

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
  
  // Fonction pour charger les pharmacies
  const loadPharmacies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/pharmacies');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des pharmacies');
      }
      
      const data = await response.json();
      setPharmacies(data.pharmacies || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Charger les pharmacies au montage du composant
  useEffect(() => {
    loadPharmacies();
  }, []);
  
  // Fonction pour obtenir une pharmacie spécifique
  const getPharmacy = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/pharmacies/${id}`);
      
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