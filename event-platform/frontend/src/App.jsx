import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Routes, Route, Navigate } from 'react-router-dom'

// Composants
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import Dashboard from './pages/Dashboard'
import CreateEvent from './pages/CreateEvent'

// Actions
import { checkAuth } from './redux/actions/authActions'

/**
 * Composant App - Racine de l'application
 * Gère le routage principal et la vérification de l'authentification
 */
function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, loading } = useSelector(state => state.auth)

  // Vérifier l'authentification au chargement de l'application
  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  // Affichage pendant le chargement initial
  if (loading) {
    return (
      <div className="app">
        <div className="loading" style={{ height: '100vh' }}>
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Barre de navigation - affichée uniquement si authentifié */}
      <Navbar />
      
      {/* Contenu principal */}
      <main className="main-content">
        <Routes>
          {/* Routes publiques */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/events" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/events" /> : <Register />} 
          />
          
          {/* Routes protégées - nécessitent une authentification */}
          <Route 
            path="/events" 
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/events/:id" 
            element={
              <ProtectedRoute>
                <EventDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Route admin - création d'événement */}
          <Route 
            path="/events/create" 
            element={
              <ProtectedRoute adminOnly>
                <CreateEvent />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirection par défaut */}
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/events" : "/login"} />} 
          />
          
          {/* Page 404 */}
          <Route 
            path="*" 
            element={
              <div className="empty-state">
                <h2 className="empty-state-title">Page non trouvée</h2>
                <p>La page que vous recherchez n'existe pas.</p>
              </div>
            } 
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
