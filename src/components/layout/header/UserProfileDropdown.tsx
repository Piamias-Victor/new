// src/components/layout/header/UserProfileDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUser, FiSettings, FiLock, FiLogOut, FiShield, FiChevronDown } from 'react-icons/fi';

interface UserProfileDropdownProps {
  user: any;
  handleSignOut: () => Promise<void>;
}

export function UserProfileDropdown({ user, handleSignOut }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fermer le dropdown lors d'un clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="h-8 w-8 rounded-full bg-sky-600 dark:bg-sky-700 flex items-center justify-center text-white">
          <span className="font-medium text-sm">{user.name?.charAt(0) || user.email?.charAt(0)}</span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-800 dark:text-white truncate w-24 ">
            {user.name || 'Utilisateur'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-24">
            {user.role === 'admin' ? 'Administrateur' : (user.pharmacyName || 'Utilisateur')}
          </p>
        </div>
        <FiChevronDown className="text-gray-500 dark:text-gray-400" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user.name || 'Utilisateur'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {user.email}
            </p>
          </div>
          
          <div className="py-1">
            <Link 
              href="/profile" 
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <FiUser className="mr-3 text-gray-500 dark:text-gray-400" />
              Mon profil
            </Link>
            
            <Link 
              href="/profile/change-password" 
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <FiLock className="mr-3 text-gray-500 dark:text-gray-400" />
              Changer mon mot de passe
            </Link>
            
            {user.role === 'admin' && (
              <Link 
                href="/admin/users" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <FiShield className="mr-3 text-gray-500 dark:text-gray-400" />
                Administration
              </Link>
            )}
            {user.role === 'admin' && (
              <Link 
                href="/admin/pharmacies" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <FiShield className="mr-3 text-gray-500 dark:text-gray-400" />
                Pharmacie
              </Link>
            )}
          </div>
          
          <div className="py-1 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => {
                setIsOpen(false);
                handleSignOut();
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiLogOut className="mr-3 text-gray-500 dark:text-gray-400" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}