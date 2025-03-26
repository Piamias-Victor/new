// src/app/admin/users/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FiUser, FiArrowLeft, FiSave } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { AddUserModal } from '@/components/admin/AddUserModal';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  pharmacyId: string | null;
  pharmacyName: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Rediriger si non authentifié ou non admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session.user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Charger les données de l'utilisateur
  useEffect(() => {
    const loadUser = async () => {
      if (status !== 'authenticated' || !id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/users/${id}`);
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données de l\'utilisateur');
        }
        
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, [id, status]);

  // État de chargement
  if (status === 'loading' || (status === 'authenticated' && isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  // Si non admin ou non authentifié, ne rien afficher (la redirection se fera via useEffect)
  if (status !== 'authenticated' || session.user.role !== 'admin') {
    return null;
  }

  // Si l'utilisateur n'a pas été trouvé
  if (!isLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Utilisateur non trouvé
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              L'utilisateur que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Button
              leftIcon={<FiArrowLeft />}
              onClick={() => router.push('/admin/users')}
            >
              Retour à la liste
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <FiUser className="mr-2" />
            Modifier l'utilisateur
          </h1>
          
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              leftIcon={<FiArrowLeft />}
              onClick={() => router.push('/admin/users')}
            >
              Retour
            </Button>
            
            <Button
              leftIcon={<FiSave />}
              onClick={() => setIsModalOpen(true)}
            >
              Modifier
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}
        
        {user && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden divide-y divide-gray-200 dark:divide-gray-700">
            <div className="px-6 py-5">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Informations de l'utilisateur
              </h3>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom</span>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.name}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</span>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Rôle</span>
                  <p className="mt-1 text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                      {user.role === 'admin' ? 'Admin' : 'Pharmacie'}
                    </span>
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Pharmacie</span>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {user.pharmacyName || '-'}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Créé le</span>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Dernière connexion</span>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString('fr-FR', {
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Jamais'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal d'édition */}
      {user && (
        <AddUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            // Recharger les données de l'utilisateur après mise à jour
            setIsModalOpen(false);
            router.refresh();
            // Recharger les données
            setIsLoading(true);
            fetch(`/api/users/${id}`)
              .then(res => res.json())
              .then(data => setUser(data))
              .catch(err => setError('Erreur lors du rechargement des données'))
              .finally(() => setIsLoading(false));
          }}
          existingUser={{
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            pharmacyId: user.pharmacyId
          }}
        />
      )}
    </div>
  );
}