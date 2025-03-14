'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { FiMenu, FiX, FiUser, FiLogOut, FiBarChart2 } from 'react-icons/fi';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  // Vérifier si l'utilisateur est sur le dashboard
  const isDashboard = pathname?.startsWith('/dashboard');

  // Effet pour détecter le défilement
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
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

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled || isDashboard ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / Lien d'accueil */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-teal-600 dark:from-sky-400 dark:to-teal-400 bg-clip-text text-transparent">
                Apo Data
              </span>
            </Link>
          </div>
          
          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center space-x-4">
            {!isDashboard && (
              <>
                <Link href="/#features" className="text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 px-3 py-2 rounded-md text-sm font-medium">
                  Fonctionnalités
                </Link>
                <Link href="/#about" className="text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 px-3 py-2 rounded-md text-sm font-medium">
                  À propos
                </Link>
                <Link href="/#contact" className="text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 px-3 py-2 rounded-md text-sm font-medium">
                  Contact
                </Link>
              </>
            )}
            
            {/* Actions utilisateur */}
            {status === 'authenticated' ? (
              <div className="flex items-center space-x-2">
                {!isDashboard && (
                  <Link href="/dashboard" className="flex items-center px-4 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700 transition-colors duration-200 text-sm font-medium">
                    <FiBarChart2 className="mr-2" />
                    Dashboard
                  </Link>
                )}
                <button 
                  onClick={handleSignOut} 
                  className="flex items-center px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
                >
                  <FiLogOut className="mr-2" />
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login" className="flex items-center px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 text-sm font-medium">
                  <FiUser className="mr-2" />
                  Connexion
                </Link>
              </div>
            )}
          </nav>
          
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
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg rounded-b-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {!isDashboard && (
              <>
                <Link 
                  href="/#features" 
                  onClick={closeMenu}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Fonctionnalités
                </Link>
                <Link 
                  href="/#about" 
                  onClick={closeMenu}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  À propos
                </Link>
                <Link 
                  href="/#contact" 
                  onClick={closeMenu}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Contact
                </Link>
              </>
            )}
            
            {/* Actions utilisateur mobile */}
            {status === 'authenticated' ? (
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                {!isDashboard && (
                  <Link 
                    href="/dashboard" 
                    onClick={closeMenu}
                    className="flex items-center px-3 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700 transition-colors duration-200 text-base font-medium"
                  >
                    <FiBarChart2 className="mr-2" />
                    Dashboard
                  </Link>
                )}
                <button 
                  onClick={() => {
                    closeMenu();
                    handleSignOut();
                  }} 
                  className="flex w-full items-center px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-base font-medium"
                >
                  <FiLogOut className="mr-2" />
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <Link 
                  href="/auth/login" 
                  onClick={closeMenu}
                  className="flex items-center px-3 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700 transition-colors duration-200 text-base font-medium"
                >
                  <FiUser className="mr-2" />
                  Connexion
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}