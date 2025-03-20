import Link from 'next/link';
import { FiBarChart2, FiLogOut, FiUser } from 'react-icons/fi';

interface MobileMenuProps {
  isDashboard: boolean;
  status: string;
  sessionData?: any;
  closeMenu: () => void;
  handleSignOut: () => Promise<void>;
}

export function MobileMenu({ isDashboard, status, sessionData, closeMenu, handleSignOut }: MobileMenuProps) {
  return (
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
  );
}