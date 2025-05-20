// src/hooks/usePharmacy.ts
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

export interface PharmacyFormData {
  name: string;
  ca: string;
  area: string;
  employees_count: string;
  address: string;
}

export function usePharmacy(id: string) {
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [formData, setFormData] = useState<PharmacyFormData>({
    name: '',
    ca: '',
    area: '',
    employees_count: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Charger les données de la pharmacie
  const loadPharmacy = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/pharmacies/${id}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données de la pharmacie');
      }
      
      const data = await response.json();
      setPharmacy(data.pharmacy);
      
      // Initialiser le formulaire avec les données existantes
      setFormData({
        name: data.pharmacy.name || '',
        ca: data.pharmacy.ca !== null ? String(data.pharmacy.ca) : '',
        area: data.pharmacy.area || '',
        employees_count: data.pharmacy.employees_count !== null ? String(data.pharmacy.employees_count) : '',
        address: data.pharmacy.address || ''
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    if (id) {
      loadPharmacy();
    }
  }, [id]);

  // Mettre à jour le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Soumettre les modifications
  const updatePharmacy = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      // Préparer les données à envoyer
      const pharmacyData = {
        name: formData.name,
        ca: formData.ca ? parseFloat(formData.ca) : null,
        area: formData.area || null,
        employees_count: formData.employees_count ? parseInt(formData.employees_count, 10) : null,
        address: formData.address || null
      };
      
      // Envoyer la requête de mise à jour
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
      
      // Mettre à jour l'état local
      setPharmacy(data.pharmacy);
      setSuccessMessage('Pharmacie mise à jour avec succès');
      
      return data.pharmacy;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    pharmacy,
    formData,
    isLoading,
    isSaving,
    error,
    successMessage,
    handleChange,
    updatePharmacy,
    loadPharmacy,
    setError,
    setSuccessMessage
  };
}