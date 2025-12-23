import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import authReducer from './reducers/authReducer'
import eventsReducer from './reducers/eventsReducer'
import participationsReducer from './reducers/participationsReducer'
import evaluationsReducer from './reducers/evaluationsReducer'


const thunkMiddleware = ({ dispatch, getState }) => next => action => {
  // Si l'action est une fonction, on l'exécute avec dispatch et getState
  if (typeof action === 'function') {
    return action(dispatch, getState)
  }
  // Sinon, on passe l'action au middleware suivant
  return next(action)
}


const loggerMiddleware = store => next => action => {
  // Désactiver en production
  if (process.env.NODE_ENV !== 'production') {
    console.group(action.type)
    console.log('Action:', action)
    const result = next(action)
    console.log('Nouvel état:', store.getState())
    console.groupEnd()
    return result
  }
  return next(action)
}


const rootReducer = combineReducers({
  auth: authReducer,           
  events: eventsReducer,       
  participations: participationsReducer,  
  evaluations: evaluationsReducer         
})

const composeEnhancers = 
  (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose

const store = createStore(
  rootReducer,
  composeEnhancers(
    applyMiddleware(thunkMiddleware, loggerMiddleware)
  )
)

export default store
