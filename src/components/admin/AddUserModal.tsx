// src/components/admin/AddUserModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { FiX, FiUser, FiMail, FiLock, FiHome } from 'react-icons/fi';
import { AuthInput } from '@/components/auth/AuthInput';
import { Button } from '@/components/ui/Button';

interface Pharmacy {
  id: string;
  name: string;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
    pharmacyId: string | null;
  };
}

export function AddUserModal({ isOpen, onClose, onSuccess, existingUser }: AddUserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('pharmacy_user');
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mode édition vs création
  const isEditMode = !!existingUser;
  
  // Charger les pharmacies
  useEffect(() => {
    const loadPharmacies = async () => {
      try {
        const response = await fetch('/api/pharmacies');
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des pharmacies');
        }
        
        const data = await response.json();
        setPharmacies(data.pharmacies || []);
      } catch (error) {
        console.error('Erreur lors du chargement des pharmacies:', error);
      }
    };
    
    loadPharmacies();
  }, []);
  
  // Initialiser les champs si on est en mode édition
  useEffect(() => {
    if (existingUser) {
      setName(existingUser.name);
      setEmail(existingUser.email);
      setPassword(''); // Ne pas afficher le mot de passe existant
      setRole(existingUser.role);
      setPharmacyId(existingUser.pharmacyId);
    } else {
      // Réinitialiser les champs en mode création
      setName('');
      setEmail('');
      setPassword('');
      setRole('pharmacy_user');
      setPharmacyId(null);
    }
  }, [existingUser, isOpen]);
  
  // Traiter le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Validation des champs
      if (!name || !email) {
        throw new Error('Nom et email sont requis');
      }
      
      if (!isEditMode && !password) {
        throw new Error('Mot de passe requis pour un nouvel utilisateur');
      }
      
      if (role === 'pharmacy_user' && !pharmacyId) {
        throw new Error('Veuillez sélectionner une pharmacie pour cet utilisateur');
      }
      
      // Construire les données à envoyer
      const userData = {
        name,
        email,
        ...(password ? { password } : {}),
        role,
        pharmacyId: role === 'admin' ? null : pharmacyId
      };
      
      // API Call
      const url = isEditMode 
        ? `/api/users/${existingUser.id}` 
        : '/api/users';
        
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'opération');
      }
      
      // Fermer le modal et rafraîchir la liste
      onClose();
      onSuccess();
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 transition-opacity"
          onClick={onClose}
        ></div>
        
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Fermer</span>
              <FiX className="h-6 w-6" />
            </button>
          </div>
          
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
              {isEditMode ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
            </h3>
            
            {error && (
              <div className="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <AuthInput
                id="name"
                name="name"
                type="text"
                icon={<FiUser className="h-5 w-5 text-gray-400" />}
                placeholder="Nom de l'utilisateur"
                value={name}
                onChange={(e) => setName(e.target.value)}
                label="Nom"
              />
              
              <AuthInput
                id="email"
                name="email"
                type="email"
                icon={<FiMail className="h-5 w-5 text-gray-400" />}
                placeholder="Email"
                // Suite de src/components/admin/AddUserModal.tsx
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                label="Email"
              />
              
              <AuthInput
                id="password"
                name="password"
                type="password"
                icon={<FiLock className="h-5 w-5 text-gray-400" />}
                placeholder={isEditMode ? "Laisser vide pour ne pas modifier" : "Mot de passe"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label="Mot de passe"
                helpText={isEditMode ? "Laisser vide pour conserver le mot de passe actuel" : ""}
              />
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rôle
                </label>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="pharmacy_user">Utilisateur Pharmacie</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              
              {role === 'pharmacy_user' && (
                <div>
                  <label htmlFor="pharmacyId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pharmacie
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiHome className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="pharmacyId"
                      name="pharmacyId"
                      value={pharmacyId || ''}
                      onChange={(e) => setPharmacyId(e.target.value || null)}
                      className="mt-1 block w-full pl-10 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Sélectionner une pharmacie</option>
                      {pharmacies.map((pharmacy) => (
                        <option key={pharmacy.id} value={pharmacy.id}>
                          {pharmacy.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              <div className="mt-5 sm:mt-6 flex space-x-2 justify-end">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  type="button"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  isLoading={isLoading}
                >
                  {isEditMode ? 'Mettre à jour' : 'Ajouter'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}