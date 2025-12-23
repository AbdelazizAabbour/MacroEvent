
import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children 
 * @param {boolean} props.adminOnly 
 */
function ProtectedRoute({ children, adminOnly = false }) {
  const location = useLocation()
  
  // Récupération de l'état d'authentification
  const { isAuthenticated, user, loading } = useSelector(state => state.auth)
  
  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }
  
  // Rediriger vers login si non authentifié
  if (!isAuthenticated) {
    // Sauvegarder la page demandée pour redirection après login
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  // Vérification des droits admin
  if (adminOnly && user?.role !== 'admin') {
    return (
      <div className="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z"/>
        </svg>
        <h2 className="empty-state-title">Accès refusé</h2>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
      </div>
    )
  }
  
  // Afficher le composant enfant si authentifié
  return children
}

export default ProtectedRoute
