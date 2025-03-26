// src/app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiUsers, FiEdit, FiTrash2, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { AddUserModal } from '@/components/admin/AddUserModal'; // À implémenter

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  pharmacyName: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export default function UsersAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Rediriger si non authentifié ou non admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session.user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Charger les utilisateurs
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des utilisateurs');
      }
      
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les utilisateurs au chargement de la page
  useEffect(() => {
    if (status === 'authenticated' && session.user.role === 'admin') {
      loadUsers();
    }
  }, [status, session]);

  // Fonction pour supprimer un utilisateur
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      
// Suite de src/app/admin/users/page.tsx
if (!response.ok) {
    throw new Error('Erreur lors de la suppression de l\'utilisateur');
  }
  
  // Recharger la liste des utilisateurs
  loadUsers();
} catch (error) {
  setError(error instanceof Error ? error.message : 'Une erreur est survenue');
}
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
if (status !== 'authenticated' || session.user.role !== 'admin') {
return null;
}

return (
<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
        <FiUsers className="mr-2" />
        Gestion des utilisateurs
      </h1>
      
      <div className="flex space-x-2">
        <Button
          variant="secondary"
          leftIcon={<FiRefreshCw />}
          onClick={loadUsers}
        >
          Actualiser
        </Button>
        
        <Button
          leftIcon={<FiPlus />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Ajouter un utilisateur
        </Button>
      </div>
    </div>
    
    {error && (
      <div className="mb-6 p-4 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
        {error}
      </div>
    )}
    
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Nom
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rôle
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Pharmacie
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Dernière connexion
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Créé le
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                    {user.role === 'admin' ? 'Admin' : 'Pharmacie'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.pharmacyName || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
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
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                      className="text-sky-600 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  
  {/* Modal d'ajout d'utilisateur */}
  <AddUserModal 
    isOpen={isAddModalOpen} 
    onClose={() => setIsAddModalOpen(false)}
    onSuccess={loadUsers}
  />
</div>
);
}