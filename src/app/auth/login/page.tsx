'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthFormError } from '@/components/auth/AuthFormError';
import { AuthInput } from '@/components/auth/AuthInput';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Identifiants incorrects. Veuillez réessayer.');
      } else {
        router.push('/');
      }
    } catch (error) {
      setError('Une erreur est survenue. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard 
      title="Connexion à votre compte" 
      subtitle="Accédez à la plateforme d'analyse de données pour pharmacies"
    >
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

          <AuthInput
            id="password"
            name="password"
            type="password"
            icon={<FiLock className="h-5 w-5 text-gray-400" />}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            label="Mot de passe"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Se souvenir de moi
            </label>
          </div>

          <div className="text-sm">
            <Link 
              href="/auth/forgot-password" 
              className="font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        <AuthButton isLoading={isLoading} loadingText="Connexion en cours...">
          Se connecter <FiArrowRight className="ml-2" />
        </AuthButton>
        
      </form>
    </AuthCard>
  );
}