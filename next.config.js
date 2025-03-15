/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Avertissement plutôt que d'arrêter le build sur les erreurs ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorer les erreurs TS lors du build
    ignoreBuildErrors: true,
  },
  /* Vos configurations ici */
}

module.exports = nextConfig