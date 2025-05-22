// src/app/admin/pharmacies/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiEdit, FiSearch, FiRefreshCw, FiHome } from 'react-icons/fi';
import { usePharmacies } from '@/hooks/usePharmacies';
import { Notification } from '@/components/ui/Notification';

export default function PharmaciesAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { pharmacies, isLoading, error, loadPharmacies } = usePharmacies();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Ref pour savoir si c'est le premier chargement
  const isFirstLoad = useRef(true);
  const lastPathname = useRef(pathname);

  // Redirection si non authentifié ou non admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session.user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Rechargement à chaque fois qu'on arrive sur cette page
  useEffect(() => {
    // Si c'est le premier chargement, on laisse le hook faire son travail
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      lastPathname.current = pathname;
      return;
    }

    // Si on revient sur cette page depuis une autre page
    if (lastPathname.current !== pathname || document.visibilityState === 'visible') {
      console.log('🔄 Navigation détectée - Rechargement des pharmacies');
      loadPharmacies();
    }
    
    lastPathname.current = pathname;
  }, [pathname, loadPharmacies]);

  // Listener pour le focus de la page/onglet
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isFirstLoad.current) {
        console.log('👁️ Page visible - Rechargement des pharmacies');
        loadPharmacies();
      }
    };

    const handleFocus = () => {
      if (!isFirstLoad.current) {
        console.log('🎯 Focus détecté - Rechargement des pharmacies');
        loadPharmacies();
      }
    };

    // Écouter les changements de visibilité
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Écouter le focus de la fenêtre
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadPharmacies]);

  // Rechargement forcé quand on clique sur le bouton refresh
  const handleManualRefresh = () => {
    console.log('🔄 Rechargement manuel demandé');
    loadPharmacies();
  };

  // Filtrer les pharmacies par recherche
  const filteredPharmacies = pharmacies.filter(pharmacy => 
    pharmacy.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacy.id_nat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacy.area?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formater le chiffre d'affaires
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // État de chargement
  if (status === 'loading' || (status === 'authenticated' && isLoading && isFirstLoad.current)) {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <FiHome className="mr-2" />
            Gestion des pharmacies
            {isLoading && !isFirstLoad.current && (
              <div className="ml-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-sky-500"></div>
            )}
          </h1>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" size={18} />
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-2 pr-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            
            <button
              onClick={handleManualRefresh}
              disabled={isLoading}
              className={`p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Actualiser"
            >
              <FiRefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
        
        {/* Affichage des messages d'erreur */}
        {error && (
          <Notification 
            type="error" 
            message={error} 
          />
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID National
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nom
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Zone
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPharmacies.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-sky-500 mr-2"></div>
                          Chargement...
                        </div>
                      ) : pharmacies.length === 0 ? (
                        'Aucune pharmacie trouvée'
                      ) : (
                        'Aucun résultat pour votre recherche'
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredPharmacies.map((pharmacy) => (
                    <tr key={pharmacy.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {pharmacy.id_nat || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {pharmacy.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {pharmacy.area || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/pharmacies/${pharmacy.id}`}
                          className="text-sky-600 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300 flex items-center justify-end"
                        >
                          <span className="hidden sm:inline mr-1">Modifier</span>
                          <FiEdit size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination si nécessaire */}
          {pharmacies.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm">
              Affichage de {filteredPharmacies.length} sur {pharmacies.length} pharmacies
              {isLoading && !isFirstLoad.current && (
                <span className="ml-2 text-sky-500">• Actualisation en cours...</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}