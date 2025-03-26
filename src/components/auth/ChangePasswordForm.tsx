// src/components/auth/ChangePasswordForm.tsx
'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthFormError } from '@/components/auth/AuthFormError';
import { AuthInput } from '@/components/auth/AuthInput';
import { FiLock, FiCheckCircle } from 'react-icons/fi';

export function ChangePasswordForm() {
  const { data: session } = useSession();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    // Validation
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setIsLoading(false);
      return;
    }

    if (!currentPassword || !newPassword) {
      setError('Tous les champs sont requis.');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Le nouveau mot de passe doit comporter au moins 8 caractères.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/users/${session?.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          password: newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      // Réinitialiser le formulaire et afficher le succès
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(true);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Changer mon mot de passe
      </h2>

      {success && (
        <div className="mb-6 p-4 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 flex items-start">
          <FiCheckCircle className="mt-0.5 mr-2 flex-shrink-0" />
          <p>Votre mot de passe a été modifié avec succès.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthFormError error={error} />
        <AuthInput// Suite du composant src/components/auth/ChangePasswordForm.tsx
          id="currentPassword"
          name="currentPassword"
          type="password"
          placeholder="Votre mot de passe actuel"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          label="Mot de passe actuel"
          icon={<FiLock className="h-5 w-5 text-gray-400" />}
          autoComplete="current-password"
        />

        <AuthInput
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="Votre nouveau mot de passe"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          label="Nouveau mot de passe"
          icon={<FiLock className="h-5 w-5 text-gray-400" />}
          autoComplete="new-password"
          helpText="8 caractères minimum"
        />

        <AuthInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirmez votre nouveau mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          label="Confirmer le mot de passe"
          icon={<FiLock className="h-5 w-5 text-gray-400" />}
          autoComplete="new-password"
        />

        <AuthButton 
          isLoading={isLoading} 
          loadingText="Modification en cours..."
        >
          Modifier mon mot de passe
        </AuthButton>
      </form>
    </div>
  );
}
