

import api from './axiosConfig'


const evaluationsApi = {
  /**
   * Récupère la liste des évaluations
   * @param {Object} params 
 
   * @returns {Promise} 
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams()
    
    if (params.event_id) queryParams.append('event_id', params.event_id)
    if (params.user_id) queryParams.append('user_id', params.user_id)
    
    const queryString = queryParams.toString()
    const url = `/evaluations/index.php${queryString ? '?' + queryString : ''}`
    
    return await api.get(url)
  },
  
  /**
   * Crée une nouvelle évaluation
   * @param {Object} evaluationData
   * @returns {Promise} 
   */
  create: async (evaluationData) => {
    return await api.post('/evaluations/index.php', evaluationData)
  },
  
  /**
   * Met à jour une évaluation
   * @param {number} id
   * @param {Object} data 

   * @returns {Promise} 
   */
  update: async (id, data) => {
    return await api.put(`/evaluations/index.php?id=${id}`, data)
  },
  
  /**
   * @param {number} id 
   * @returns {Promise} 
   */
  delete: async (id) => {
    return await api.delete(`/evaluations/index.php?id=${id}`)
  }
}

export default evaluationsApi
