import Link from 'next/link';

interface NavLinkProps {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
  isMobile?: boolean;
}

export function NavLink({ href, onClick, children, isMobile = false }: NavLinkProps) {
  const baseClasses = "text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400";
  
  const desktopClasses = `${baseClasses} px-3 py-2 rounded-md text-sm font-medium`;
  
  const mobileClasses = `block px-3 py-2 rounded-md text-base font-medium ${baseClasses} hover:bg-gray-50 dark:hover:bg-gray-700`;
  
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={isMobile ? mobileClasses : desktopClasses}
    >
      {children}
    </Link>
  );
}