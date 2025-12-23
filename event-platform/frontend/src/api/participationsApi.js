

import api from './axiosConfig'


const participationsApi = {
  /**
   * Récupère la liste des participations
   * @param {Object} params 
   * @returns {Promise} 
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams()
    
    if (params.user_id) queryParams.append('user_id', params.user_id)
    if (params.event_id) queryParams.append('event_id', params.event_id)
    
    const queryString = queryParams.toString()
    const url = `/participations/index.php${queryString ? '?' + queryString : ''}`
    
    return await api.get(url)
  },
  
  /**
   * Inscrit l'utilisateur à un événement
   * @param {number} eventId 
   * @returns {Promise} 
   */
  register: async (eventId) => {
    return await api.post('/participations/index.php', { event_id: eventId })
  },
  
  /**
   * Annule la participation à un événement
   * @param {number} eventId 
   * @returns {Promise} 
   */
  cancel: async (eventId) => {
    return await api.delete(`/participations/index.php?event_id=${eventId}`)
  }
}

export default participationsApi
