import React from 'react';

interface AuthButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function AuthButton({ 
  children, 
  isLoading = false, 
  loadingText = 'Chargement...', 
  onClick,
  type = 'submit' 
}: AuthButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className="w-full py-3 flex justify-center items-center rounded-md bg-sky-600 text-white font-medium hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}