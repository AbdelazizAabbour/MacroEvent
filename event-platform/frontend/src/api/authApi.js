
import api from './axiosConfig'

const authApi = {
  /**
   * Connexion d'un utilisateur
   * @param {Object} credentials - { email, password }
   * @returns {Promise} 
   */
  login: async (credentials) => {
    return await api.post('/auth/login.php', credentials)
  },
  
  /**
   * Inscription d'un nouvel utilisateur
   * @param {Object} userData - { username, email, password }
   * @returns {Promise} 
   */
  register: async (userData) => {
    return await api.post('/auth/register.php', userData)
  },
  
  /**
   * Déconnexion de l'utilisateur
   * @returns {Promise} 
   */
  logout: async () => {
    return await api.post('/auth/logout.php')
  },
  
  /**
   * Récupère les informations de l'utilisateur connecté
   * @returns {Promise} 
   */
  me: async () => {
    return await api.get('/auth/me.php')
  }
}

export default authApi
