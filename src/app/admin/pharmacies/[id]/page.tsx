// src/app/admin/pharmacies/[id]/page.tsx (version avec hook)
'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FiHome, FiArrowLeft, FiSave } from 'react-icons/fi';
import Link from 'next/link';
import { usePharmacy } from '@/hooks/usePharmacy';
import { PharmacyInfoCard } from '@/components/admin/PharmacyInfoCard';
import { Notification } from '@/components/ui/Notification';
import { Button } from '@/components/ui/Button';

export default function EditPharmacyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const { 
    pharmacy, 
    formData, 
    isLoading, 
    isSaving, 
    error, 
    successMessage, 
    handleChange, 
    updatePharmacy, 
    setError, 
    setSuccessMessage 
  } = usePharmacy(id as string);

  // Redirection si non authentifié ou non admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session.user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePharmacy();
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
    }
  };

  // Gérer le retour à la liste
  const handleBack = () => {
    router.push('/admin/pharmacies');
  };

  // État de chargement
  if (status === 'loading' || (status === 'authenticated' && isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  // Si non admin ou non authentifié, ne rien afficher (la redirection se fera via useEffect)
  if (status !== 'authenticated' || session?.user?.role !== 'admin') {
    return null;
  }

  // Si la pharmacie n'est pas trouvée
  if (!isLoading && !pharmacy) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Pharmacie non trouvée
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              La pharmacie que vous recherchez n'existe pas ou a été supprimée.
            </p>
            <Button
              variant="primary"
              leftIcon={<FiArrowLeft />}
              onClick={handleBack}
            >
              Retour à la liste
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <FiHome className="mr-2" />
            Modifier la pharmacie
          </h1>
          
          <Button
            variant="secondary"
            leftIcon={<FiArrowLeft />}
            onClick={handleBack}
          >
            Retour
          </Button>
        </div>
        
        {/* Affichage des messages d'erreur ou de succès */}
        {error && (
          <Notification 
            type="error" 
            message={error}
            onClose={() => setError(null)}
          />
        )}
        
        {successMessage && (
          <Notification 
            type="success" 
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        )}
        
        {/* Informations non modifiables */}
        {pharmacy && (
          <PharmacyInfoCard
            id={pharmacy.id}
            id_nat={pharmacy.id_nat}
            title="Informations fixes"
          />
        )}
        
        {/* Formulaire de modification */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Informations modifiables
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom de la pharmacie
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            
            <div>
              <label htmlFor="ca" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Chiffre d'affaires (€)
              </label>
              <input
                id="ca"
                name="ca"
                type="number"
                step="0.01"
                value={formData.ca}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Saisir le montant en euros sans les centimes (ex: 1500000)
              </p>
            </div>
            
            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Zone
              </label>
              <input
                id="area"
                name="area"
                type="text"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Par exemple: Urbaine, Rurale, Centre-ville, etc.
              </p>
            </div>
            
            <div>
              <label htmlFor="employees_count" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre d'employés
              </label>
              <input
                id="employees_count"
                name="employees_count"
                type="number"
                min="0"
                value={formData.employees_count}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Adresse
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button
              variant="secondary"
              className="mr-3"
              onClick={handleBack}
            >
              Annuler
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              leftIcon={<FiSave />}
              isLoading={isSaving}
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}