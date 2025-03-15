// src/components/layout/ClientLayout.tsx
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/providers/AuthProvider";
import { DateRangeProvider } from "@/contexts/DateRangeContext";
import { PharmacyProvider } from "@/providers/PharmacyProvider";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  // Utilisez un état pour suivre si l'app est hydratée (côté client)
  const [isHydrated, setIsHydrated] = useState(false);

  // Exécuté seulement côté client
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Afficher un spinner de chargement pendant l'hydratation
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <DateRangeProvider>
        <PharmacyProvider>
          {/* Global header */}
          <Header />
          
          {/* Main content */}
          {children}

          {/* Global footer */}
          <Footer />
        </PharmacyProvider>
      </DateRangeProvider>
    </AuthProvider>
  );
}