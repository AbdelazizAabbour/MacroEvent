import { PARTICIPATIONS_TYPES } from '../actions/participationsActions'

// État initial des participations
const initialState = {
  participations: [],   // Liste des participations de l'utilisateur
  loading: false,       // Chargement en cours
  error: null           // Message d'erreur
}

/**
 * @param {Object} state 
 * @param {Object} action 
 * @returns {Object}
 */
const participationsReducer = (state = initialState, action) => {
  switch (action.type) {
    // ========== RÉCUPÉRATION DES PARTICIPATIONS ==========
    case PARTICIPATIONS_TYPES.FETCH_PARTICIPATIONS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case PARTICIPATIONS_TYPES.FETCH_PARTICIPATIONS_SUCCESS:
      return {
        ...state,
        participations: action.payload,
        loading: false,
        error: null
      }
    
    case PARTICIPATIONS_TYPES.FETCH_PARTICIPATIONS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      }
    
    // ========== INSCRIPTION ==========
    case PARTICIPATIONS_TYPES.REGISTER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case PARTICIPATIONS_TYPES.REGISTER_SUCCESS:
      return {
        ...state,
        participations: [action.payload.participation, ...state.participations],
        loading: false,
        error: null
      }
    
    case PARTICIPATIONS_TYPES.REGISTER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      }
    
    // ========== ANNULATION ==========
    case PARTICIPATIONS_TYPES.CANCEL_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case PARTICIPATIONS_TYPES.CANCEL_SUCCESS:
      return {
        ...state,
        participations: state.participations.filter(
          p => p.event_id !== action.payload
        ),
        loading: false,
        error: null
      }
    
    case PARTICIPATIONS_TYPES.CANCEL_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      }
    
    // ========== NETTOYAGE ==========
    case PARTICIPATIONS_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }
    
    default:
      return state
  }
}

export default participationsReducer
