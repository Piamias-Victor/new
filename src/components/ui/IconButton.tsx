import React, { ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const iconButtonVariants = cva(
  "inline-flex items-center justify-center transition-all focus-visible:outline-none active:scale-95 disabled:opacity-70 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 shadow-md hover:shadow active:shadow-inner",
        secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200 shadow-sm hover:shadow-md dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700",
        outline: "border-2 border-sky-500 text-sky-600 bg-transparent hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/30",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800",
        danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md hover:shadow",
      },
      size: {
        xs: "h-7 w-7 text-xs",
        sm: "h-9 w-9 text-sm",
        md: "h-10 w-10",
        lg: "h-12 w-12 text-lg",
      },
      rounded: {
        default: "rounded-lg",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      rounded: "default",
    },
  }
);

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: React.ReactNode;
  isLoading?: boolean;
}

export function IconButton({
  className,
  variant,
  size,
  rounded,
  icon,
  isLoading,
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <button
      className={cn(iconButtonVariants({ variant, size, rounded }), className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        icon
      )}
    </button>
  );
}