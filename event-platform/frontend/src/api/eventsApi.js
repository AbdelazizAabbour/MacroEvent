/**
 * ============================================================================
 * PLATEFORME INTELLIGENTE DE GESTION D'ÉVÉNEMENTS
 * Fichier : api/eventsApi.js
 * Description : Appels API pour la gestion des événements
 * ============================================================================
 */

import api from './axiosConfig'

/**
 * API pour les événements
 * Gère le CRUD des événements
 */
const eventsApi = {
  /**
   * Récupère la liste des événements
   * @param {Object} params - Paramètres de filtrage
   *   - status: 'open' | 'full' | 'cancelled' | 'completed'
   *   - search: Terme de recherche
   *   - page: Numéro de page
   *   - limit: Nombre de résultats par page
   * @returns {Promise} Réponse de l'API
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams()
    
    if (params.status) queryParams.append('status', params.status)
    if (params.search) queryParams.append('search', params.search)
    if (params.page) queryParams.append('page', params.page)
    if (params.limit) queryParams.append('limit', params.limit)
    
    const queryString = queryParams.toString()
    const url = `/events/index.php${queryString ? '?' + queryString : ''}`
    
    return await api.get(url)
  },
  
  /**
   * @param {number} id 
   * @returns {Promise} 
   */
  getOne: async (id) => {
    return await api.get(`/events/show.php?id=${id}`)
  },
  
  /**
   * Crée un nouvel événement
   * @param {Object} eventData 
   * @returns {Promise} 
   */
  create: async (eventData) => {
    return await api.post('/events/index.php', eventData)
  },
  
  /**
   * Met à jour un événement
   * @param {number} id 
   * @param {Object} eventData 
   * @returns {Promise}
   */
  update: async (id, eventData) => {
    return await api.put(`/events/show.php?id=${id}`, eventData)
  },
  
  /**
   * Supprime un événement
   * @param {number} id 
   * @returns {Promise}
   */
  delete: async (id) => {
    return await api.delete(`/events/show.php?id=${id}`)
  }
}

export default eventsApi
