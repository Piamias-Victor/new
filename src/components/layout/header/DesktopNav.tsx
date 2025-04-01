import Link from 'next/link';
import { FiBarChart2, FiLogOut, FiUser } from 'react-icons/fi';
import { UserProfileDropdown } from './UserProfileDropdown';

interface DesktopNavProps {
  isDashboard: boolean;
  status: string;
  sessionData?: any;
  handleSignOut: () => Promise<void>;
}

export function DesktopNav({ isDashboard, status, sessionData, handleSignOut }: DesktopNavProps) {
  return (
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
            <>
            <Link href="/docs" className="text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 px-3 py-2 rounded-md text-sm font-medium">
              Documentation
            </Link>
            <Link href="/dashboard" className="flex items-center px-4 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700 transition-colors duration-200 text-sm font-medium">
              <FiBarChart2 className="mr-2" />
              Dashboard
            </Link>
            </>
            
          )}
          {status === 'authenticated' && (
                <UserProfileDropdown 
                  user={sessionData.user} 
                  handleSignOut={handleSignOut}
                />
              )}
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
  );
}