// src/components/layout/ClientLayout.tsx
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/providers/AuthProvider";
import { DateRangeProvider } from "@/contexts/DateRangeContext";
import { PharmacyProvider } from "@/providers/PharmacyProvider";
import { ProductFilterProvider } from '@/contexts/ProductFilterContext';
import { DataLoadingProvider } from '@/contexts/DataLoadingContext';

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
    <PharmacyProvider>        {/* D'ABORD les données de base */}
      <ProductFilterProvider>
        <DataLoadingProvider>  {/* ENSUITE le contrôle de chargement */}
          <Header />
          {children}
          <Footer />
        </DataLoadingProvider>
      </ProductFilterProvider>
    </PharmacyProvider>
  </DateRangeProvider>
</AuthProvider>
  );
}