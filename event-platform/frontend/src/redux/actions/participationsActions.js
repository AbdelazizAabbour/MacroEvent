import participationsApi from '../../api/participationsApi'

// Types d'actions pour les participations
export const PARTICIPATIONS_TYPES = {
  // Récupération des participations
  FETCH_PARTICIPATIONS_REQUEST: 'PARTICIPATIONS/FETCH_REQUEST',
  FETCH_PARTICIPATIONS_SUCCESS: 'PARTICIPATIONS/FETCH_SUCCESS',
  FETCH_PARTICIPATIONS_FAILURE: 'PARTICIPATIONS/FETCH_FAILURE',
  
  // Inscription à un événement
  REGISTER_REQUEST: 'PARTICIPATIONS/REGISTER_REQUEST',
  REGISTER_SUCCESS: 'PARTICIPATIONS/REGISTER_SUCCESS',
  REGISTER_FAILURE: 'PARTICIPATIONS/REGISTER_FAILURE',
  
  // Annulation de participation
  CANCEL_REQUEST: 'PARTICIPATIONS/CANCEL_REQUEST',
  CANCEL_SUCCESS: 'PARTICIPATIONS/CANCEL_SUCCESS',
  CANCEL_FAILURE: 'PARTICIPATIONS/CANCEL_FAILURE',
  
  // Nettoyage
  CLEAR_ERROR: 'PARTICIPATIONS/CLEAR_ERROR'
}

/**
 * @param {Object} params 
 */
export const fetchParticipations = (params = {}) => async (dispatch) => {
  dispatch({ type: PARTICIPATIONS_TYPES.FETCH_PARTICIPATIONS_REQUEST })
  
  try {
    const response = await participationsApi.getAll(params)
    
    if (response.success) {
      dispatch({
        type: PARTICIPATIONS_TYPES.FETCH_PARTICIPATIONS_SUCCESS,
        payload: response.data.participations
      })
    } else {
      dispatch({
        type: PARTICIPATIONS_TYPES.FETCH_PARTICIPATIONS_FAILURE,
        payload: response.error
      })
    }
  } catch (error) {
    dispatch({
      type: PARTICIPATIONS_TYPES.FETCH_PARTICIPATIONS_FAILURE,
      payload: error.response?.data?.error || 'Erreur lors de la récupération'
    })
  }
}

/**
 * @param {number} eventId 
 */
export const registerToEvent = (eventId) => async (dispatch) => {
  dispatch({ type: PARTICIPATIONS_TYPES.REGISTER_REQUEST })
  
  try {
    const response = await participationsApi.register(eventId)
    
    if (response.success) {
      dispatch({
        type: PARTICIPATIONS_TYPES.REGISTER_SUCCESS,
        payload: {
          participation: response.data.participation,
          eventId
        }
      })
      
      return { success: true, message: response.message }
    } else {
      dispatch({
        type: PARTICIPATIONS_TYPES.REGISTER_FAILURE,
        payload: response.error
      })
      
      return { success: false, error: response.error }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Erreur lors de l\'inscription'
    
    dispatch({
      type: PARTICIPATIONS_TYPES.REGISTER_FAILURE,
      payload: errorMessage
    })
    
    return { success: false, error: errorMessage }
  }
}

/**
 * @param {number} eventId - ID de l'événement
 */
export const cancelParticipation = (eventId) => async (dispatch) => {
  dispatch({ type: PARTICIPATIONS_TYPES.CANCEL_REQUEST })
  
  try {
    const response = await participationsApi.cancel(eventId)
    
    if (response.success) {
      dispatch({
        type: PARTICIPATIONS_TYPES.CANCEL_SUCCESS,
        payload: eventId
      })
      
      return { success: true, message: response.message }
    } else {
      dispatch({
        type: PARTICIPATIONS_TYPES.CANCEL_FAILURE,
        payload: response.error
      })
      
      return { success: false, error: response.error }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Erreur lors de l\'annulation'
    
    dispatch({
      type: PARTICIPATIONS_TYPES.CANCEL_FAILURE,
      payload: errorMessage
    })
    
    return { success: false, error: errorMessage }
  }
}


export const clearError = () => ({
  type: PARTICIPATIONS_TYPES.CLEAR_ERROR
})
