
import axios from 'axios'

/**
 * Instance Axios configurée pour l'API
 */
const api = axios.create({
  // URL corrigée - sans /backend car le serveur PHP est lancé depuis backend/
  baseURL: 'http://localhost:8000/api',
  
  // Envoyer les cookies avec chaque requête
  withCredentials: true,
  
  // Headers par défaut
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // Timeout de 30 secondes
  timeout: 30000
})

/**
 * Intercepteur de requête
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Intercepteur de réponse
 */
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          localStorage.removeItem('token')
          break
        case 403:
          console.error('Accès interdit:', data.error || 'Permission refusée')
          break
        case 404:
          console.error('Ressource non trouvée:', data.error)
          break
        case 500:
          console.error('Erreur serveur:', data.error || 'Erreur interne')
          break
        default:
          console.error('Erreur API:', data.error || error.message)
      }
    } else if (error.request) {
      console.error('Pas de réponse du serveur')
    } else {
      console.error('Erreur de configuration:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default api