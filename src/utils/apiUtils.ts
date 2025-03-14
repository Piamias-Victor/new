import axios from 'axios';

// Configuration de base pour axios (à modifier selon l'API)
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  async (config) => {
    // Obtenir le token depuis le localStorage ou un autre mécanisme de stockage
    const token = typeof window !== 'undefined' ? localStorage.getItem('apodata_token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gérer les erreurs d'authentification (401)
    if (error.response && error.response.status === 401) {
      // Rediriger vers la page de connexion ou actualiser le token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('apodata_token');
        window.location.href = '/auth/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// Fonctions utilitaires pour les appels API courants
export const fetchData = async (endpoint: string) => {
  try {
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des données depuis ${endpoint}:`, error);
    throw error;
  }
};

export const postData = async (endpoint: string, data: any) => {
  try {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de l'envoi des données vers ${endpoint}:`, error);
    throw error;
  }
};

export const updateData = async (endpoint: string, data: any) => {
  try {
    const response = await apiClient.put(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour des données vers ${endpoint}:`, error);
    throw error;
  }
};

export const deleteData = async (endpoint: string) => {
  try {
    const response = await apiClient.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la suppression des données depuis ${endpoint}:`, error);
    throw error;
  }
};