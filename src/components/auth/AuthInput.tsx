import React from 'react';

interface AuthInputProps {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  autoComplete?: string;
  icon?: React.ReactNode;
  helpText?: string;
}

export function AuthInput({
  id,
  name,
  type,
  placeholder,
  value,
  onChange,
  label,
  autoComplete,
  icon,
  helpText
}: AuthInputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={onChange}
          className={`appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
            icon ? 'pl-10' : ''
          }`}
          placeholder={placeholder}
        />
      </div>
      {helpText && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
    </div>
  );
}