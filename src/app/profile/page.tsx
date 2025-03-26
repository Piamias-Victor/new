// src/app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiHome, FiEdit } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Rediriger si non authentifié
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Initialiser les champs avec les données de session
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
    }
  }, [session]);

  // Gérer la mise à jour du profil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/users/${session?.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        // Suite de src/app/profile/page.tsx
        body: JSON.stringify({
            name,
            email
          }),
        });
  
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erreur lors de la mise à jour du profil');
        }
  
        // Mettre à jour la session
        await update({
          ...session,
          user: {
            ...session?.user,
            name,
            email
          }
        });
  
        setSuccessMessage('Profil mis à jour avec succès');
        setIsEditMode(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };
  
    // Afficher un état de chargement si la session est en cours de chargement
    if (status === 'loading') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
        </div>
      );
    }
  
    // Si pas de session, ne rien afficher (la redirection se fera via useEffect)
    if (!session) {
      return null;
    }
  
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Mon profil
          </h1>
  
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                {error}
              </div>
            )}
  
            {successMessage && (
              <div className="mb-4 p-3 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                {successMessage}
              </div>
            )}
  
            {isEditMode ? (
              <form onSubmit={handleUpdateProfile}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nom
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>
                  </div>
  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>
                  </div>
  
                  <div className="flex space-x-3 mt-6">
                    <Button
                      type="submit"
                      isLoading={isLoading}
                    >
                      Enregistrer
                    </Button>
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => {
                        setIsEditMode(false);
                        // Réinitialiser les données
                        setName(session.user.name || '');
                        setEmail(session.user.email || '');
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Informations personnelles
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<FiEdit size={14} />}
                    onClick={() => setIsEditMode(true)}
                  >
                    Modifier
                  </Button>
                </div>
  
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom</span>
                    <p className="mt-1 flex items-center">
                      <FiUser className="mr-2 text-gray-400" size={16} />
                      <span className="text-gray-900 dark:text-white">{session.user.name || '-'}</span>
                    </p>
                  </div>
  
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</span>
                    <p className="mt-1 flex items-center">
                      <FiMail className="mr-2 text-gray-400" size={16} />
                      <span className="text-gray-900 dark:text-white">{session.user.email}</span>
                    </p>
                  </div>
  
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Rôle</span>
                    <p className="mt-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${session.user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                        {session.user.role === 'admin' ? 'Administrateur' : 'Utilisateur pharmacie'}
                      </span>
                    </p>
                  </div>
  
                  {session.user.role === 'pharmacy_user' && session.user.pharmacyName && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Pharmacie</span>
                      <p className="mt-1 flex items-center">
                        <FiHome className="mr-2 text-gray-400" size={16} />
                        <span className="text-gray-900 dark:text-white">{session.user.pharmacyName}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
  
          <ChangePasswordForm />
        </div>
      </div>
    );
  }