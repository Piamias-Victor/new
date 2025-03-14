import { FiMail, FiPhone } from "react-icons/fi";

export function Contact() {
  return (
    <section id="contact" className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Contact
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Pour toute information concernant le projet Apo Data, n'hésitez pas à nous contacter.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact information */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Phardev</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1 w-10 h-10 flex items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300">
                  <FiMail size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-1 text-gray-900 dark:text-white">Email</h4>
                  <p className="text-gray-600 dark:text-gray-300">sasphardev@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1 w-10 h-10 flex items-center justify-center rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300">
                  <FiPhone size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-1 text-gray-900 dark:text-white">Téléphone</h4>
                  <p className="text-gray-600 dark:text-gray-300">+33 (0)6 24 17 47 24</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-center flex flex-col items-center">
              <p className="text-gray-600 dark:text-gray-300 font-medium mb-4">
                Piamias Victor
              </p>
            </div>
          </div>
          
          {/* Contact form */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Envoyez-nous un message</h3>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Votre nom"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="votre.email@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Votre message..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-medium transition-colors duration-200"
              >
                Envoyer
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}