import Link from 'next/link';

/**
 * Hero Component
 * 
 * Main banner section for the homepage that presents the Apo Data project
 * and its objectives in a clean, minimalist design.
 */
export function Hero() {
  return (
    <section className="py-20 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
        {/* Left column: Text content */}
        <div className="space-y-8">
          {/* Subtle badge/tag for visual interest */}
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
            Apothical Développement
          </div>
          
          {/* Main headline with gradient effect */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-sky-600 to-teal-600 dark:from-sky-400 dark:to-teal-400 bg-clip-text text-transparent">
            Apo Data
          </h1>
          
          {/* Descriptive subheading */}
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-gray-200">
            Plateforme d&apos;analyse de données pour pharmacies
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
            Développée par Phardev, cette solution est conçue spécifiquement pour 
            votre groupement, offrant des outils d&apos;analyse puissants pour optimiser 
            vos opérations et performances.
          </p>
          
          {/* Quick navigation buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="#features"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-sky-600 text-white font-medium hover:bg-sky-700 transition-colors duration-200 shadow-sm"
            >
              Fonctionnalités
            </Link>
            <Link
              href="#about"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors duration-200 shadow-sm"
            >
              À propos de Phardev
            </Link>
          </div>
        </div>
        
        {/* Right column: Visual element */}
        <div className="relative h-full flex justify-center lg:justify-end items-center">
          
          {/* Dashboard mockup/illustration */}
          <div className="relative w-full max-w-lg aspect-[4/3] bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="absolute top-0 inset-x-0 h-6 bg-gray-100 dark:bg-gray-800 flex items-center px-3 gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            </div>
            <div className="pt-8 px-4 grid grid-cols-2 gap-4">
              <div className="col-span-2 h-28 bg-gradient-to-r from-sky-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-medium">
                Tableau de bord Apo Data
              </div>
              <div className="h-24 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 flex flex-col justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">Ventes</div>
                <div className="text-lg font-semibold">+12.5%</div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-emerald-500 rounded-full"></div>
                </div>
              </div>
              <div className="h-24 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 flex flex-col justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">Stocks</div>
                <div className="text-lg font-semibold">42 jours</div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-sky-500 rounded-full"></div>
                </div>
              </div>
              <div className="col-span-2 h-20 bg-white dark:bg-gray-800 rounded-lg shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}