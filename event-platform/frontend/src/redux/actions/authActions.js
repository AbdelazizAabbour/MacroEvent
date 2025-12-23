import authApi from '../../api/authApi'


export const AUTH_TYPES = {
  // Connexion
  LOGIN_REQUEST: 'AUTH/LOGIN_REQUEST',
  LOGIN_SUCCESS: 'AUTH/LOGIN_SUCCESS',
  LOGIN_FAILURE: 'AUTH/LOGIN_FAILURE',
  
  // Inscription
  REGISTER_REQUEST: 'AUTH/REGISTER_REQUEST',
  REGISTER_SUCCESS: 'AUTH/REGISTER_SUCCESS',
  REGISTER_FAILURE: 'AUTH/REGISTER_FAILURE',
  
  // Déconnexion
  LOGOUT_REQUEST: 'AUTH/LOGOUT_REQUEST',
  LOGOUT_SUCCESS: 'AUTH/LOGOUT_SUCCESS',
  
  // Vérification de l'authentification
  CHECK_AUTH_REQUEST: 'AUTH/CHECK_AUTH_REQUEST',
  CHECK_AUTH_SUCCESS: 'AUTH/CHECK_AUTH_SUCCESS',
  CHECK_AUTH_FAILURE: 'AUTH/CHECK_AUTH_FAILURE',
  
  // Réinitialisation des erreurs
  CLEAR_ERROR: 'AUTH/CLEAR_ERROR'
}

/**
 * @param {Object} credentials
 */
export const login = (credentials) => async (dispatch) => {
  dispatch({ type: AUTH_TYPES.LOGIN_REQUEST })
  
  try {
    const response = await authApi.login(credentials)
    
    if (response.success) {
      // Stocker le token dans le localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
      }
      
      dispatch({
        type: AUTH_TYPES.LOGIN_SUCCESS,
        payload: response.data.user
      })
      
      return { success: true }
    } else {
      dispatch({
        type: AUTH_TYPES.LOGIN_FAILURE,
        payload: response.error || 'Erreur de connexion'
      })
      
      return { success: false, error: response.error }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Erreur de connexion'
    
    dispatch({
      type: AUTH_TYPES.LOGIN_FAILURE,
      payload: errorMessage
    })
    
    return { success: false, error: errorMessage }
  }
}

/**
 * @param {Object} userData 
 */
export const register = (userData) => async (dispatch) => {
  dispatch({ type: AUTH_TYPES.REGISTER_REQUEST })
  
  try {
    const response = await authApi.register(userData)
    
    if (response.success) {
      dispatch({
        type: AUTH_TYPES.REGISTER_SUCCESS,
        payload: response.message
      })
      
      return { success: true, message: response.message }
    } else {
      dispatch({
        type: AUTH_TYPES.REGISTER_FAILURE,
        payload: response.error || 'Erreur d\'inscription'
      })
      
      return { success: false, error: response.error }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Erreur d\'inscription'
    
    dispatch({
      type: AUTH_TYPES.REGISTER_FAILURE,
      payload: errorMessage
    })
    
    return { success: false, error: errorMessage }
  }
}

/**
 * Action de déconnexion
 */
export const logout = () => async (dispatch) => {
  dispatch({ type: AUTH_TYPES.LOGOUT_REQUEST })
  
  try {
    await authApi.logout()
  } catch (error) {
    // Ignorer les erreurs de déconnexion
    console.error('Erreur lors de la déconnexion:', error)
  }
  
  // Nettoyer le localStorage
  localStorage.removeItem('token')
  
  dispatch({ type: AUTH_TYPES.LOGOUT_SUCCESS })
}

/**
 * Action pour vérifier l'authentification
 * Appelée au chargement de l'application
 */
export const checkAuth = () => async (dispatch) => {
  dispatch({ type: AUTH_TYPES.CHECK_AUTH_REQUEST })
  
  try {
    const response = await authApi.me()
    
    if (response.success && response.data.user) {
      dispatch({
        type: AUTH_TYPES.CHECK_AUTH_SUCCESS,
        payload: {
          user: response.data.user,
          stats: response.data.stats
        }
      })
    } else {
      dispatch({ type: AUTH_TYPES.CHECK_AUTH_FAILURE })
    }
  } catch (error) {
    // L'utilisateur n'est pas authentifié
    localStorage.removeItem('token')
    dispatch({ type: AUTH_TYPES.CHECK_AUTH_FAILURE })
  }
}

/**
 * Action pour effacer les erreurs
 */
export const clearError = () => ({
  type: AUTH_TYPES.CLEAR_ERROR
})
