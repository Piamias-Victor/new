// src/components/dashboard/pharmacies/tabs/PharmacyInfoTab.tsx
import React, { useState, useEffect } from 'react';
import { FiHome, FiUsers, FiMapPin, FiDollarSign, FiBox } from 'react-icons/fi';

// Interface pour les données de la pharmacie
interface PharmacyData {
  id: string;
  name: string;
  id_nat?: string;
  ca?: number;
  area?: string;
  employees_count?: number;
  address?: string;
}

interface PharmacyInfoTabProps {
  pharmacyId: string;
}

export function PharmacyInfoTab({ pharmacyId }: PharmacyInfoTabProps) {
  const [pharmacy, setPharmacy] = useState<PharmacyData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Récupération des détails de la pharmacie
  useEffect(() => {
    async function fetchPharmacyData() {
      if (!pharmacyId) {
        setIsLoading(false);
        setError("ID de pharmacie manquant");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/pharmacie/${pharmacyId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erreur ${response.status}`);
        }
        
        const data = await response.json();
        setPharmacy(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des données de la pharmacie:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPharmacyData();
  }, [pharmacyId]);

  // Formater le montant du CA en euros
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'Non disponible';
    
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Si chargement en cours, afficher un placeholder
  if (isLoading) {
    return (
      <div className="animate-pulse p-6">
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3 mb-8"></div>
        <div className="grid grid-cols-2 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Si erreur, afficher le message
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
          <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Si pas de pharmacie, afficher un message
  if (!pharmacy) {
    return (
      <div className="p-6">
        <div className="text-center">
          <FiHome className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Pas de données</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Aucune information disponible pour cette pharmacie.
          </p>
        </div>
      </div>
    );
  }

  // Structuration des informations avec icônes appropriées
  const infoItems = [
    { icon: <FiHome className="text-sky-500" />, label: 'Nom', value: pharmacy.name },
    { icon: <FiDollarSign className="text-emerald-500" />, label: 'Chiffre d\'affaires', value: formatCurrency(pharmacy.ca) },
    { icon: <FiBox className="text-purple-500" />, label: 'Zone', value: pharmacy.area || 'Non spécifié' },
    { icon: <FiUsers className="text-amber-500" />, label: 'Nombre d\'employés', value: pharmacy.employees_count ? `${pharmacy.employees_count} employés` : 'Non spécifié' },
    { icon: <FiMapPin className="text-red-500" />, label: 'Adresse', value: pharmacy.address || 'Non spécifiée' },
    { icon: <FiHome className="text-blue-500" />, label: 'Identifiant national', value: pharmacy.id_nat || 'Non spécifié' }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 border-b pb-2 border-gray-200 dark:border-gray-700">
        Informations de la pharmacie
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
        {infoItems.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
              {item.icon}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}