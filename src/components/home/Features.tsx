import { FiBarChart, FiPackage, FiTrendingUp, FiPieChart, FiBarChart2, FiShoppingCart } from "react-icons/fi";

/**
 * Feature card interface for type safety
 */
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

/**
 * Individual feature card component
 * Displays a single feature with icon, title and description
 */
function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="relative group p-6 bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700">
      <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

/**
 * Features Component
 * 
 * Grid display of the main project features with icons and descriptions.
 * Using a clean, card-based layout for visual clarity.
 */
export function Features() {
  // Features data array for easy management and updates
  const featuresData: FeatureCardProps[] = [
    {
      title: "Analyse des ventes",
      description: "Visualisation de l'évolution des ventes par produit, catégorie et période avec identification des tendances.",
      icon: <FiBarChart size={24} />,
    },
    {
      title: "Gestion des stocks",
      description: "Optimisation des niveaux de stock basée sur les données historiques pour éviter les ruptures et le surstockage.",
      icon: <FiPackage size={24} />,
    },
    {
      title: "Suivi des marges",
      description: "Analyse détaillée des marges par produit pour identifier les opportunités d'amélioration de la rentabilité.",
      icon: <FiTrendingUp size={24} />,
    },
    {
      title: "Tableaux de bord personnalisés",
      description: "Interfaces intuitives permettant de consulter vos KPIs essentiels selon les besoins spécifiques de votre groupement.",
      icon: <FiPieChart size={24} />,
    },
    {
      title: "Analyse comparative",
      description: "Benchmark entre les différentes pharmacies du groupement pour partager les meilleures pratiques.",
      icon: <FiBarChart2 size={24} />,
    },
    {
      title: "Intégration e-commerce",
      description: "Consolidation des données de vente physique et en ligne pour une vision unifiée de l'activité.",
      icon: <FiShoppingCart size={24} />,
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24">
      {/* Section header */}
      <div className="mb-16 text-center max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Fonctionnalités de la plateforme
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Apo Data intègre un ensemble d'outils d'analyse spécifiquement conçus pour répondre aux besoins de votre groupement pharmaceutique.
        </p>
      </div>

      {/* Features grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 px-4 sm:px-6">
        {featuresData.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </section>
  );
}