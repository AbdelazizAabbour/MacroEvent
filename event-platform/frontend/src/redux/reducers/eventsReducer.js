import { EVENTS_TYPES } from '../actions/eventsActions'

// État initial des événements
const initialState = {
  events: [],               // Liste des événements
  currentEvent: null,       // Événement actuellement affiché
  participants: [],         // Participants de l'événement courant
  evaluations: [],          // Évaluations de l'événement courant
  userParticipation: null,  // Participation de l'utilisateur courant
  userEvaluation: null,     // Évaluation de l'utilisateur courant
  pagination: {             // Informations de pagination
    total: 0,
    page: 1,
    limit: 20,
    total_pages: 0
  },
  loading: false,           // Chargement en cours
  error: null               // Message d'erreur
}

/**
 * @param {Object} state 
 * @param {Object} action 
 * @returns {Object}
 */
const eventsReducer = (state = initialState, action) => {
  switch (action.type) {
    // ========== LISTE DES ÉVÉNEMENTS ==========
    case EVENTS_TYPES.FETCH_EVENTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case EVENTS_TYPES.FETCH_EVENTS_SUCCESS:
      return {
        ...state,
        events: action.payload.events,
        pagination: action.payload.pagination,
        loading: false,
        error: null
      }
    
    case EVENTS_TYPES.FETCH_EVENTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      }
    
    // ========== DÉTAILS D'UN ÉVÉNEMENT ==========
    case EVENTS_TYPES.FETCH_EVENT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case EVENTS_TYPES.FETCH_EVENT_SUCCESS:
      return {
        ...state,
        currentEvent: action.payload.event,
        participants: action.payload.participants || [],
        evaluations: action.payload.evaluations || [],
        userParticipation: action.payload.user_participation,
        userEvaluation: action.payload.user_evaluation,
        loading: false,
        error: null
      }
    
    case EVENTS_TYPES.FETCH_EVENT_FAILURE:
      return {
        ...state,
        currentEvent: null,
        loading: false,
        error: action.payload
      }
    
    // ========== CRÉATION D'UN ÉVÉNEMENT ==========
    case EVENTS_TYPES.CREATE_EVENT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case EVENTS_TYPES.CREATE_EVENT_SUCCESS:
      return {
        ...state,
        events: [action.payload, ...state.events],
        loading: false,
        error: null
      }
    
    case EVENTS_TYPES.CREATE_EVENT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      }
    
    // ========== MISE À JOUR D'UN ÉVÉNEMENT ==========
    case EVENTS_TYPES.UPDATE_EVENT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case EVENTS_TYPES.UPDATE_EVENT_SUCCESS:
      return {
        ...state,
        events: state.events.map(event =>
          event.id === action.payload.id ? action.payload : event
        ),
        currentEvent: state.currentEvent?.id === action.payload.id
          ? action.payload
          : state.currentEvent,
        loading: false,
        error: null
      }
    
    case EVENTS_TYPES.UPDATE_EVENT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      }
    
    // ========== SUPPRESSION D'UN ÉVÉNEMENT ==========
    case EVENTS_TYPES.DELETE_EVENT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case EVENTS_TYPES.DELETE_EVENT_SUCCESS:
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.payload),
        currentEvent: state.currentEvent?.id === action.payload
          ? null
          : state.currentEvent,
        loading: false,
        error: null
      }
    
    case EVENTS_TYPES.DELETE_EVENT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      }
    
    // ========== NETTOYAGE ==========
    case EVENTS_TYPES.CLEAR_CURRENT_EVENT:
      return {
        ...state,
        currentEvent: null,
        participants: [],
        evaluations: [],
        userParticipation: null,
        userEvaluation: null
      }
    
    case EVENTS_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }
    
    default:
      return state
  }
}

export default eventsReducer
