/**
 * Objectives Component
 * 
 * Presents the main objectives and expected outcomes of the Apo Data project.
 * Uses a clean, visually appealing design to highlight key goals.
 */
export function Objectives() {
    return (
      <section id="objectives" className="py-16 sm:py-24">
        {/* Container with gradient background and rounded corners */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 to-teal-600">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-sky-500/30 blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-teal-500/30 blur-3xl"></div>
          </div>
          
          {/* Content wrapper */}
          <div className="relative px-6 py-16 sm:px-12 sm:py-20 text-center text-white">
            {/* Main heading */}
            <h2 className="text-3xl sm:text-4xl font-bold mb-8">
              Objectifs du projet
            </h2>
            
            {/* Grid of objectives */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <div className="text-xl font-bold mb-3">Optimisation des stocks</div>
                <p className="opacity-90">Réduire les immobilisations de capital et les ruptures de stock pour améliorer la trésorerie.</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <div className="text-xl font-bold mb-3">Amélioration des marges</div>
                <p className="opacity-90">Identifier les produits et catégories les plus rentables pour optimiser les achats et la mise en avant.</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <div className="text-xl font-bold mb-3">Pilotage par la donnée</div>
                <p className="opacity-90">Permettre aux pharmaciens de prendre des décisions basées sur des analyses précises plutôt que sur l'intuition.</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <div className="text-xl font-bold mb-3">Harmonisation du groupement</div>
                <p className="opacity-90">Créer un langage commun basé sur les mêmes indicateurs pour faciliter les échanges entre pharmacies.</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <div className="text-xl font-bold mb-3">Gain de temps</div>
                <p className="opacity-90">Automatiser l'analyse des données pour permettre aux équipes de se concentrer sur le conseil et le service client.</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <div className="text-xl font-bold mb-3">Agilité commerciale</div>
                <p className="opacity-90">Adapter rapidement les stratégies commerciales en fonction des tendances du marché identifiées.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }