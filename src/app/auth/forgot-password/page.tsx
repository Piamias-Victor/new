// src/app/auth/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthFormError } from '@/components/auth/AuthFormError';
import { FiMail, FiArrowRight, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Veuillez saisir une adresse email valide.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      setSuccess(true);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Mot de passe oublié"
      subtitle="Entrez votre email pour recevoir un lien de réinitialisation"
    >
      {success ? (
        <div className="mt-8 p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <FiCheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Email envoyé
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Si un compte est associé à cette adresse email, vous recevrez un lien de réinitialisation.
            Vérifiez votre boîte de réception et vos spams.
          </p>
          <div className="mt-6">
            <Link 
              href="/auth/login"
              className="inline-flex items-center text-sm font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
            >
              <FiArrowLeft className="mr-2" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      ) : (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <AuthFormError error={error} />

          <div className="space-y-4">
            <AuthInput
              id="email"
              name="email"
              type="email"
              icon={<FiMail className="h-5 w-5 text-gray-400" />}
              placeholder="votre.email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              label="Email"
            />
          </div>

          <AuthButton isLoading={isLoading} loadingText="Envoi en cours...">
            Réinitialiser mon mot de passe <FiArrowRight className="ml-2" />
          </AuthButton>

          <div className="flex items-center justify-center mt-4">
            <Link 
              href="/auth/login"
              className="text-sm text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300 font-medium"
            >
              Retour à la connexion
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
}