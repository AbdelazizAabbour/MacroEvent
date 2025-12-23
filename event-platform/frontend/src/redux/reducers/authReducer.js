import { AUTH_TYPES } from '../actions/authActions'

// État initial de l'authentification
const initialState = {
  user: null,               // Données de l'utilisateur connecté
  stats: null,              // Statistiques de l'utilisateur
  isAuthenticated: false,   // Indique si l'utilisateur est connecté
  loading: true,            // Chargement en cours (vérification initiale)
  error: null,              // Message d'erreur
  registerSuccess: false    // Succès de l'inscription
}

/**
 * @param {Object} state 
 * @param {Object} action 
 * @returns {Object} 
 */
const authReducer = (state = initialState, action) => {
  switch (action.type) {
    // ========== CONNEXION ==========
    case AUTH_TYPES.LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case AUTH_TYPES.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      }
    
    case AUTH_TYPES.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      }
    
    // ========== INSCRIPTION ==========
    case AUTH_TYPES.REGISTER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        registerSuccess: false
      }
    
    case AUTH_TYPES.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        registerSuccess: true
      }
    
    case AUTH_TYPES.REGISTER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        registerSuccess: false
      }
    
    // ========== DÉCONNEXION ==========
    case AUTH_TYPES.LOGOUT_REQUEST:
      return {
        ...state,
        loading: true
      }
    
    case AUTH_TYPES.LOGOUT_SUCCESS:
      return {
        ...initialState,
        loading: false
      }
    
    // ========== VÉRIFICATION AUTH ==========
    case AUTH_TYPES.CHECK_AUTH_REQUEST:
      return {
        ...state,
        loading: true
      }
    
    case AUTH_TYPES.CHECK_AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        stats: action.payload.stats,
        isAuthenticated: true,
        loading: false,
        error: null
      }
    
    case AUTH_TYPES.CHECK_AUTH_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      }
    
    // ========== NETTOYAGE ==========
    case AUTH_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null,
        registerSuccess: false
      }
    
    default:
      return state
  }
}

export default authReducer
