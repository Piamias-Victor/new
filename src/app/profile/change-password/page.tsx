// src/app/profile/change-password/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { Button } from '@/components/ui/Button';

export default function ChangePasswordPage() {
  const { status } = useSession();
  const router = useRouter();

  // Rediriger si non authentifié
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Afficher un état de chargement
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  // Si non authentifié, ne rien afficher (la redirection se fera via useEffect)
  if (status !== 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Changer mon mot de passe
          </h1>
          
          <Link href="/profile">
            <Button
              variant="outline"
              leftIcon={<FiArrowLeft size={14} />}
            >
              Retour au profil
            </Button>
          </Link>
        </div>

        <ChangePasswordForm />
      </div>
    </div>
  );
}