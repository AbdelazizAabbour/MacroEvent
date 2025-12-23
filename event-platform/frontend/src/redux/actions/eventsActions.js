import eventsApi from '../../api/eventsApi'

// Types d'actions pour les événements
export const EVENTS_TYPES = {
  // Récupération de la liste
  FETCH_EVENTS_REQUEST: 'EVENTS/FETCH_EVENTS_REQUEST',
  FETCH_EVENTS_SUCCESS: 'EVENTS/FETCH_EVENTS_SUCCESS',
  FETCH_EVENTS_FAILURE: 'EVENTS/FETCH_EVENTS_FAILURE',
  
  // Récupération d'un événement
  FETCH_EVENT_REQUEST: 'EVENTS/FETCH_EVENT_REQUEST',
  FETCH_EVENT_SUCCESS: 'EVENTS/FETCH_EVENT_SUCCESS',
  FETCH_EVENT_FAILURE: 'EVENTS/FETCH_EVENT_FAILURE',
  
  // Création d'un événement
  CREATE_EVENT_REQUEST: 'EVENTS/CREATE_EVENT_REQUEST',
  CREATE_EVENT_SUCCESS: 'EVENTS/CREATE_EVENT_SUCCESS',
  CREATE_EVENT_FAILURE: 'EVENTS/CREATE_EVENT_FAILURE',
  
  // Mise à jour d'un événement
  UPDATE_EVENT_REQUEST: 'EVENTS/UPDATE_EVENT_REQUEST',
  UPDATE_EVENT_SUCCESS: 'EVENTS/UPDATE_EVENT_SUCCESS',
  UPDATE_EVENT_FAILURE: 'EVENTS/UPDATE_EVENT_FAILURE',
  
  // Suppression d'un événement
  DELETE_EVENT_REQUEST: 'EVENTS/DELETE_EVENT_REQUEST',
  DELETE_EVENT_SUCCESS: 'EVENTS/DELETE_EVENT_SUCCESS',
  DELETE_EVENT_FAILURE: 'EVENTS/DELETE_EVENT_FAILURE',
  
  // Nettoyage
  CLEAR_CURRENT_EVENT: 'EVENTS/CLEAR_CURRENT_EVENT',
  CLEAR_ERROR: 'EVENTS/CLEAR_ERROR'
}

/**
 * @param {Object} params 
 */
export const fetchEvents = (params = {}) => async (dispatch) => {
  dispatch({ type: EVENTS_TYPES.FETCH_EVENTS_REQUEST })
  
  try {
    const response = await eventsApi.getAll(params)
    
    if (response.success) {
      dispatch({
        type: EVENTS_TYPES.FETCH_EVENTS_SUCCESS,
        payload: {
          events: response.data.events,
          pagination: response.data.pagination
        }
      })
    } else {
      dispatch({
        type: EVENTS_TYPES.FETCH_EVENTS_FAILURE,
        payload: response.error
      })
    }
  } catch (error) {
    dispatch({
      type: EVENTS_TYPES.FETCH_EVENTS_FAILURE,
      payload: error.response?.data?.error || 'Erreur lors de la récupération des événements'
    })
  }
}

/**
 * Récupère les détails d'un événement
 * @param {number} id - ID de l'événement
 */
export const fetchEvent = (id) => async (dispatch) => {
  dispatch({ type: EVENTS_TYPES.FETCH_EVENT_REQUEST })
  
  try {
    const response = await eventsApi.getOne(id)
    
    if (response.success) {
      dispatch({
        type: EVENTS_TYPES.FETCH_EVENT_SUCCESS,
        payload: response.data
      })
    } else {
      dispatch({
        type: EVENTS_TYPES.FETCH_EVENT_FAILURE,
        payload: response.error
      })
    }
  } catch (error) {
    dispatch({
      type: EVENTS_TYPES.FETCH_EVENT_FAILURE,
      payload: error.response?.data?.error || 'Événement non trouvé'
    })
  }
}

/**
 * Crée un nouvel événement
 * @param {Object} eventData - Données de l'événement
 */
export const createEvent = (eventData) => async (dispatch) => {
  dispatch({ type: EVENTS_TYPES.CREATE_EVENT_REQUEST })
  
  try {
    const response = await eventsApi.create(eventData)
    
    if (response.success) {
      dispatch({
        type: EVENTS_TYPES.CREATE_EVENT_SUCCESS,
        payload: response.data.event
      })
      
      return { success: true, event: response.data.event }
    } else {
      dispatch({
        type: EVENTS_TYPES.CREATE_EVENT_FAILURE,
        payload: response.error
      })
      
      return { success: false, error: response.error }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Erreur lors de la création'
    
    dispatch({
      type: EVENTS_TYPES.CREATE_EVENT_FAILURE,
      payload: errorMessage
    })
    
    return { success: false, error: errorMessage }
  }
}

/**
 * Met à jour un événement
 * @param {number} id - ID de l'événement
 * @param {Object} eventData - Nouvelles données
 */
export const updateEvent = (id, eventData) => async (dispatch) => {
  dispatch({ type: EVENTS_TYPES.UPDATE_EVENT_REQUEST })
  
  try {
    const response = await eventsApi.update(id, eventData)
    
    if (response.success) {
      dispatch({
        type: EVENTS_TYPES.UPDATE_EVENT_SUCCESS,
        payload: response.data.event
      })
      
      return { success: true }
    } else {
      dispatch({
        type: EVENTS_TYPES.UPDATE_EVENT_FAILURE,
        payload: response.error
      })
      
      return { success: false, error: response.error }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Erreur lors de la mise à jour'
    
    dispatch({
      type: EVENTS_TYPES.UPDATE_EVENT_FAILURE,
      payload: errorMessage
    })
    
    return { success: false, error: errorMessage }
  }
}

/**
 * Supprime un événement
 * @param {number} id - ID de l'événement
 */
export const deleteEvent = (id) => async (dispatch) => {
  dispatch({ type: EVENTS_TYPES.DELETE_EVENT_REQUEST })
  
  try {
    const response = await eventsApi.delete(id)
    
    if (response.success) {
      dispatch({
        type: EVENTS_TYPES.DELETE_EVENT_SUCCESS,
        payload: id
      })
      
      return { success: true }
    } else {
      dispatch({
        type: EVENTS_TYPES.DELETE_EVENT_FAILURE,
        payload: response.error
      })
      
      return { success: false, error: response.error }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Erreur lors de la suppression'
    
    dispatch({
      type: EVENTS_TYPES.DELETE_EVENT_FAILURE,
      payload: errorMessage
    })
    
    return { success: false, error: errorMessage }
  }
}


export const clearCurrentEvent = () => ({
  type: EVENTS_TYPES.CLEAR_CURRENT_EVENT
})


export const clearError = () => ({
  type: EVENTS_TYPES.CLEAR_ERROR
})
