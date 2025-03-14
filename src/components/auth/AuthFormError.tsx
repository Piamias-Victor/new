import React from 'react';

interface AuthFormErrorProps {
  error: string | null;
}

export function AuthFormError({ error }: AuthFormErrorProps) {
  if (!error) return null;
  
  return (
    <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
      <div className="flex">
        <div>
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      </div>
    </div>
  );
}