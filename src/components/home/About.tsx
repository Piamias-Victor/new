import { FiCode, FiDatabase, FiUsers } from "react-icons/fi";

/**
 * AboutValue component
 * Represents a value or principle of the company
 */
interface AboutValueProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function AboutValue({ icon, title, description }: AboutValueProps) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 mt-1">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </div>
  );
}

/**
 * About Component
 * 
 * Presents information about Phardev, the company behind Apo Data.
 * Focuses on company mission, values and expertise.
 */
export function About() {
  // Company values/principles
  const values = [
    {
      icon: <FiCode size={20} />,
      title: "Expertise technique",
      description: "Notre équipe de développeurs spécialisés conçoit des solutions sur mesure adaptées aux problématiques spécifiques du secteur pharmaceutique."
    },
    {
      icon: <FiDatabase size={20} />,
      title: "Intelligence des données",
      description: "Nous transformons des données complexes en insights actionnables grâce à des algorithmes sophistiqués et une expérience approfondie du secteur."
    },
    {
      icon: <FiUsers size={20} />,
      title: "Approche collaborative",
      description: "Nous travaillons en étroite collaboration avec les groupements pharmaceutiques pour développer des outils qui répondent précisément à leurs besoins."
    }
  ];

  return (
    <section id="about" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left column: Company info */}
          <div className="space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              À propos de Phardev
            </h2>
            
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Phardev est une société spécialisée dans le développement de solutions 
              technologiques pour le secteur pharmaceutique. Notre mission est de 
              transformer la façon dont les pharmacies utilisent leurs données pour 
              prendre des décisions stratégiques.
            </p>
            
            <div className="space-y-6 mt-8">
              {values.map((value, index) => (
                <AboutValue 
                  key={index}
                  icon={value.icon}
                  title={value.title}
                  description={value.description}
                />
              ))}
            </div>
          </div>
          
          {/* Right column: Visual element */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-teal-500/10"></div>
            
            {/* Company stats cards */}
            <div className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
                Notre expertise
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-center">
                  <div className="text-3xl font-bold text-sky-600 dark:text-sky-400">3+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">années d'expérience</div>
                </div>
                
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center">
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">10+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">projets réalisés</div>
                </div>
                
                <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-center">
                  <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">30+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">pharmacies accompagnées</div>
                </div>
                
                <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-center">
                  <div className="text-3xl font-bold text-sky-600 dark:text-sky-400">Apothical</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">partenaire</div>
                </div>
              </div>
              
              <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-white">
                <p className="text-center font-medium">
                  Une équipe dédiée au service de votre réussite
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}