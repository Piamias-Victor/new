'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { FiMenu, FiX } from 'react-icons/fi';
import { MobileMenu } from './header/MobileMenu';
import { DesktopNav } from './header/DesktopNav';
import { ModernDateSelector } from '../shared/DateRangeSelector';
import { PharmacySelector } from '../shared/PharmacySelector';
import { AnalysisNavMenu } from './header/AnalysisNavMenu';
import { ProductSelectionDrawer } from '../drawer/ProductSelectionDrawer';
import { AnalyzeButton } from '../shared/AnalyzeButton'; // 🔥 AJOUT
import { useDrawerState } from '@/hooks/useDrawerState';
import { ProductSelectionButton } from './header/ProductSelectionButton';
import { Product } from '../drawer/search/ProductSearchResults';
import { Laboratory } from '../drawer/search/LabSearchResults';
import { Segment } from '../drawer/search/SegmentSearchResults';
import { UserProfileDropdown } from './header/UserProfileDropdown';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { isOpen, openDrawer, closeDrawer } = useDrawerState();
  
  // Vérifier si l'utilisateur est sur le dashboard
  const isDashboard = pathname?.startsWith('/dashboard');

  // Effet pour détecter le défilement
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fonction pour fermer le menu mobile
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Fonction pour déconnexion
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectedLabs, setSelectedLabs] = useState<Laboratory[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<Segment[]>([]);

  // Fonction pour ajouter/retirer un produit de la sélection
  const handleToggleProduct = (product: Product) => {
    setSelectedProducts(prevSelected => {
      // Vérifier si le produit est déjà sélectionné
      const isSelected = prevSelected.some(p => p.id === product.id);
      
      if (isSelected) {
        // Si déjà sélectionné, le retirer
        return prevSelected.filter(p => p.id !== product.id);
      } else {
        // Sinon, l'ajouter
        return [...prevSelected, product];
      }
    });
  };

  // Fonction pour ajouter/retirer un laboratoire de la sélection
  const handleToggleLab = (lab: Laboratory) => {
    setSelectedLabs(prevSelected => {
      // Vérifier si le laboratoire est déjà sélectionné
      const isSelected = prevSelected.some(l => l.name === lab.name);
      
      if (isSelected) {
        // Si déjà sélectionné, le retirer
        return prevSelected.filter(l => l.name !== lab.name);
      } else {
        // Sinon, l'ajouter
        return [...prevSelected, lab];
      }
    });
  };

  // Fonction pour ajouter/retirer un segment de la sélection
  const handleToggleSegment = (segment: Segment) => {
    setSelectedSegments(prevSelected => {
      // Vérifier si le segment est déjà sélectionné
      const isSelected = prevSelected.some(s => s.id === segment.id);
      
      if (isSelected) {
        // Si déjà sélectionné, le retirer
        return prevSelected.filter(s => s.id !== segment.id);
      } else {
        // Sinon, l'ajouter
        return [...prevSelected, segment];
      }
    });
  };

  
  
// Fonction pour confirmer la sélection
const handleConfirmSelection = () => {
  // Collecter tous les codes EAN13 des produits, laboratoires et segments sélectionnés
  const productCodes = selectedProducts.map(p => p.code_13_ref);
  
  const labCodes = selectedLabs.flatMap(lab => lab.code_13_refs || []);
  
  const segmentCodes = selectedSegments.flatMap(segment => segment.code_13_refs || []);
  
  // Fusionner tous les codes uniques
  const allCodes = [...new Set([...productCodes, ...labCodes, ...segmentCodes])];
  
  console.log('Produits sélectionnés:', selectedProducts);
  console.log('Laboratoires sélectionnés:', selectedLabs);
  console.log('Segments sélectionnés:', selectedSegments);
  console.log('Codes EAN uniques sélectionnés:', allCodes);
  
  // Vous pouvez stocker ces codes dans un état global ou les utiliser pour une requête API
  
  closeDrawer();
};

  return (
    <>
      <header 
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled || isDashboard 
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo / Lien d'accueil */}
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center flex-shrink-0">
                <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-teal-600 dark:from-sky-400 dark:to-teal-400 bg-clip-text text-transparent">
                  Apo Data
                </span>
              </Link>
              
              {/* Sélecteurs visibles uniquement sur le dashboard */}
              {isDashboard && (
                <div className="hidden md:flex items-center space-x-4">
                  {/* <AnalysisNavMenu /> */}
                  <ModernDateSelector />
                    {session?.user?.role === 'admin' && (
                    <PharmacySelector />
                  )}
                  <ProductSelectionButton openDrawer={openDrawer} />
                  
                  {/* 🔥 BOUTON ANALYSER AJOUTÉ ICI */}
                  <AnalyzeButton variant="primary" size="md" />
                </div>
              )}
            </div>
            
            {/* Navigation desktop */}
            <DesktopNav 
              isDashboard={isDashboard} 
              status={status} 
              sessionData={session}
              handleSignOut={handleSignOut} 
            />
            
            {/* Bouton menu mobile */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">{isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
                {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden">
            <MobileMenu 
              isDashboard={isDashboard} 
              status={status} 
              sessionData={session}
              closeMenu={closeMenu}
              handleSignOut={handleSignOut} 
            />
            
            {/* Afficher les sélecteurs dans le menu mobile sur le dashboard */}
            {isDashboard && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <ModernDateSelector />
                {session?.user?.role === 'admin' && (
                  <PharmacySelector />
                )}
                
                {/* Bouton de sélection de produits pour mobile */}
                {status === 'authenticated' && (
                  <div className="pt-2 space-y-2">
                    <button 
                      onClick={() => {
                        closeMenu();
                        openDrawer();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors shadow-sm"
                    >
                      <span className="font-medium">Sélection produits</span>
                    </button>
                    
                    {/* 🔥 BOUTON ANALYSER POUR MOBILE */}
                    <div onClick={closeMenu}>
                      <AnalyzeButton variant="primary" size="md" className="w-full" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Drawer de sélection de produits (en dehors du header) */}
      <ProductSelectionDrawer 
        isOpen={isOpen} 
        onClose={closeDrawer} 
        isClosing={useDrawerState().isClosing}  
        selectedProducts={selectedProducts}
        onToggleProduct={handleToggleProduct}
        selectedLabs={selectedLabs}
        onToggleLab={handleToggleLab}
        selectedSegments={selectedSegments}
        onToggleSegment={handleToggleSegment}
        onConfirmSelection={handleConfirmSelection} 
      />
    </>
  );
}