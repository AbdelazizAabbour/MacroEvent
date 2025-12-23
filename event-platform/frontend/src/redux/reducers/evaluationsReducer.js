import { EVALUATIONS_TYPES } from '../actions/evaluationsActions'

// État initial des évaluations
const initialState = {
  evaluations: [],      // Liste des évaluations
  stats: null,          // Statistiques des évaluations
  loading: false,       // Chargement en cours
  error: null           // Message d'erreur
}

/**
 * @param {Object} state 
 * @param {Object} action 
 * @returns {Object} 
 */
const evaluationsReducer = (state = initialState, action) => {
  switch (action.type) {
    // ========== RÉCUPÉRATION DES ÉVALUATIONS ==========
    case EVALUATIONS_TYPES.FETCH_EVALUATIONS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case EVALUATIONS_TYPES.FETCH_EVALUATIONS_SUCCESS:
      return {
        ...state,
        evaluations: action.payload.evaluations,
        stats: action.payload.stats,
        loading: false,
        error: null
      }
    
    case EVALUATIONS_TYPES.FETCH_EVALUATIONS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      }
    
    // ========== CRÉATION D'UNE ÉVALUATION ==========
    case EVALUATIONS_TYPES.CREATE_EVALUATION_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case EVALUATIONS_TYPES.CREATE_EVALUATION_SUCCESS:
      return {
        ...state,
        evaluations: [action.payload.evaluation, ...state.evaluations],
        loading: false,
        error: null
      }
    
    case EVALUATIONS_TYPES.CREATE_EVALUATION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      }
    
    // ========== MISE À JOUR D'UNE ÉVALUATION ==========
    case EVALUATIONS_TYPES.UPDATE_EVALUATION_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case EVALUATIONS_TYPES.UPDATE_EVALUATION_SUCCESS:
      return {
        ...state,
        evaluations: state.evaluations.map(evaluation =>
          evaluation.id === action.payload.id ? action.payload : evaluation
        ),
        loading: false,
        error: null
      }
    
    case EVALUATIONS_TYPES.UPDATE_EVALUATION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      }
    
    // ========== SUPPRESSION D'UNE ÉVALUATION ==========
    case EVALUATIONS_TYPES.DELETE_EVALUATION_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case EVALUATIONS_TYPES.DELETE_EVALUATION_SUCCESS:
      return {
        ...state,
        evaluations: state.evaluations.filter(
          evaluation => evaluation.id !== action.payload
        ),
        loading: false,
        error: null
      }
    
    case EVALUATIONS_TYPES.DELETE_EVALUATION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      }
    
    // ========== NETTOYAGE ==========
    case EVALUATIONS_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }
    
    default:
      return state
  }
}

export default evaluationsReducer
