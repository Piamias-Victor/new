import Link from 'next/link';
import { FiMail, FiPhone } from 'react-icons/fi';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-teal-600 dark:from-sky-400 dark:to-teal-400 bg-clip-text text-transparent">
                Apo Data
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Plateforme d'analyse de données dédiée aux pharmacies, développée par Phardev pour optimiser la gestion commerciale et le suivi des performances.
            </p>
          </div>
          
          {/* Liens utiles */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
              Liens utiles
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/#features" className="text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 text-sm">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 text-sm">
                  À propos de Phardev
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 text-sm">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 text-sm">
                  Connexion
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                <FiMail className="mr-2 h-4 w-4" />
                sasphardev@gmail.com
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                <FiPhone className="mr-2 h-4 w-4" />
                +33 (0)6 24 17 47 24
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            &copy; {currentYear} Apo Data by Phardev. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}