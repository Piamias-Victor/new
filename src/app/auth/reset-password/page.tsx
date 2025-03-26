// src/app/auth/reset-password/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthFormError } from '@/components/auth/AuthFormError';
import { FiLock, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Rediriger si aucun token n'est fourni
  useEffect(() => {
    if (!token) {
      router.push('/auth/forgot-password');
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit comporter au moins 8 caractères.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      setSuccess(true);
      
      // Redirection après 3 secondes
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null; // Éviter le rendu pendant la redirection
  }

  return (
    <AuthCard
      title="Réinitialisation du mot de passe"
      subtitle="Veuillez définir votre nouveau mot de passe"
    >
      {success ? (
        <div className="mt-8 p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <FiCheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Mot de passe réinitialisé
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
          </p>
        </div>
      ) : (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <AuthFormError error={error} />

          <div className="space-y-4">
            <AuthInput
              id="password"
              name="password"
              type="password"
              icon={<FiLock className="h-5 w-5 text-gray-400" />}
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              label="Nouveau mot de passe"
              helpText="8 caractères minimum"
            />

            <AuthInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              icon={<FiLock className="h-5 w-5 text-gray-400" />}
              placeholder="Confirmez le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              label="Confirmer le mot de passe"
            />
          </div>

          <AuthButton isLoading={isLoading} loadingText="Réinitialisation en cours...">
            Réinitialiser le mot de passe <FiArrowRight className="ml-2" />
          </AuthButton>
        </form>
      )}
    </AuthCard>
  );
}