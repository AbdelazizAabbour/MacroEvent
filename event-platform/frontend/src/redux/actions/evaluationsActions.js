/**
 * ============================================================================
 * PLATEFORME INTELLIGENTE DE GESTION D'ÉVÉNEMENTS
 * Fichier : redux/actions/evaluationsActions.js
 * Description : Actions Redux pour la gestion des évaluations
 * ============================================================================
 */

import evaluationsApi from '../../api/evaluationsApi'

// Types d'actions pour les évaluations
export const EVALUATIONS_TYPES = {
  // Récupération des évaluations
  FETCH_EVALUATIONS_REQUEST: 'EVALUATIONS/FETCH_REQUEST',
  FETCH_EVALUATIONS_SUCCESS: 'EVALUATIONS/FETCH_SUCCESS',
  FETCH_EVALUATIONS_FAILURE: 'EVALUATIONS/FETCH_FAILURE',
  
  // Création d'une évaluation
  CREATE_EVALUATION_REQUEST: 'EVALUATIONS/CREATE_REQUEST',
  CREATE_EVALUATION_SUCCESS: 'EVALUATIONS/CREATE_SUCCESS',
  CREATE_EVALUATION_FAILURE: 'EVALUATIONS/CREATE_FAILURE',
  
  // Mise à jour d'une évaluation
  UPDATE_EVALUATION_REQUEST: 'EVALUATIONS/UPDATE_REQUEST',
  UPDATE_EVALUATION_SUCCESS: 'EVALUATIONS/UPDATE_SUCCESS',
  UPDATE_EVALUATION_FAILURE: 'EVALUATIONS/UPDATE_FAILURE',
  
  // Suppression d'une évaluation
  DELETE_EVALUATION_REQUEST: 'EVALUATIONS/DELETE_REQUEST',
  DELETE_EVALUATION_SUCCESS: 'EVALUATIONS/DELETE_SUCCESS',
  DELETE_EVALUATION_FAILURE: 'EVALUATIONS/DELETE_FAILURE',
  
  // Nettoyage
  CLEAR_ERROR: 'EVALUATIONS/CLEAR_ERROR'
}

/**
 * @param {Object} params 
 */
export const fetchEvaluations = (params = {}) => async (dispatch) => {
  dispatch({ type: EVALUATIONS_TYPES.FETCH_EVALUATIONS_REQUEST })
  
  try {
    const response = await evaluationsApi.getAll(params)
    
    if (response.success) {
      dispatch({
        type: EVALUATIONS_TYPES.FETCH_EVALUATIONS_SUCCESS,
        payload: {
          evaluations: response.data.evaluations,
          stats: response.data.stats
        }
      })
    } else {
      dispatch({
        type: EVALUATIONS_TYPES.FETCH_EVALUATIONS_FAILURE,
        payload: response.error
      })
    }
  } catch (error) {
    dispatch({
      type: EVALUATIONS_TYPES.FETCH_EVALUATIONS_FAILURE,
      payload: error.response?.data?.error || 'Erreur lors de la récupération'
    })
  }
}

/**
 * @param {Object} evaluationData 
 */
export const createEvaluation = (evaluationData) => async (dispatch) => {
  dispatch({ type: EVALUATIONS_TYPES.CREATE_EVALUATION_REQUEST })
  
  try {
    const response = await evaluationsApi.create(evaluationData)
    
    if (response.success) {
      dispatch({
        type: EVALUATIONS_TYPES.CREATE_EVALUATION_SUCCESS,
        payload: {
          evaluation: response.data.evaluation,
          eventStats: response.data.event_stats
        }
      })
      
      return { success: true, message: response.message }
    } else {
      dispatch({
        type: EVALUATIONS_TYPES.CREATE_EVALUATION_FAILURE,
        payload: response.error
      })
      
      return { success: false, error: response.error }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Erreur lors de l\'évaluation'
    
    dispatch({
      type: EVALUATIONS_TYPES.CREATE_EVALUATION_FAILURE,
      payload: errorMessage
    })
    
    return { success: false, error: errorMessage }
  }
}

/**
 * @param {number} id 
 * @param {Object} data 
 */
export const updateEvaluation = (id, data) => async (dispatch) => {
  dispatch({ type: EVALUATIONS_TYPES.UPDATE_EVALUATION_REQUEST })
  
  try {
    const response = await evaluationsApi.update(id, data)
    
    if (response.success) {
      dispatch({
        type: EVALUATIONS_TYPES.UPDATE_EVALUATION_SUCCESS,
        payload: response.data.evaluation
      })
      
      return { success: true }
    } else {
      dispatch({
        type: EVALUATIONS_TYPES.UPDATE_EVALUATION_FAILURE,
        payload: response.error
      })
      
      return { success: false, error: response.error }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Erreur lors de la mise à jour'
    
    dispatch({
      type: EVALUATIONS_TYPES.UPDATE_EVALUATION_FAILURE,
      payload: errorMessage
    })
    
    return { success: false, error: errorMessage }
  }
}

/**
 * @param {number} id 
 */
export const deleteEvaluation = (id) => async (dispatch) => {
  dispatch({ type: EVALUATIONS_TYPES.DELETE_EVALUATION_REQUEST })
  
  try {
    const response = await evaluationsApi.delete(id)
    
    if (response.success) {
      dispatch({
        type: EVALUATIONS_TYPES.DELETE_EVALUATION_SUCCESS,
        payload: id
      })
      
      return { success: true }
    } else {
      dispatch({
        type: EVALUATIONS_TYPES.DELETE_EVALUATION_FAILURE,
        payload: response.error
      })
      
      return { success: false, error: response.error }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Erreur lors de la suppression'
    
    dispatch({
      type: EVALUATIONS_TYPES.DELETE_EVALUATION_FAILURE,
      payload: errorMessage
    })
    
    return { success: false, error: errorMessage }
  }
}

export const clearError = () => ({
  type: EVALUATIONS_TYPES.CLEAR_ERROR
})
