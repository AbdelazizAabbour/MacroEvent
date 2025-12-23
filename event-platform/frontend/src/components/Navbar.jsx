// import React from 'react'
// import { useSelector, useDispatch } from 'react-redux'
// import { Link, NavLink, useNavigate } from 'react-router-dom'
// import { logout } from '../redux/actions/authActions'

// function Navbar() {
//   const dispatch = useDispatch()
//   const navigate = useNavigate()
  
//   // Récupération de l'état d'authentification depuis Redux
//   const { isAuthenticated, user } = useSelector(state => state.auth)
  
//   /**
//    * Gestion de la déconnexion
//    */
//   const handleLogout = () => {
//     dispatch(logout())
//     navigate('/login')
//   }
  
//   // Ne pas afficher la navbar si non authentifié
//   if (!isAuthenticated) {
//     return null
//   }
  
//   return (
//     <nav className="navbar">
//       <div className="navbar-container">
//         {/* Logo / Marque */}
//         <Link to="/events" className="navbar-brand">
//           {/* Icône calendrier */}
//           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
//             <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
//           </svg>
//           EventPlatform
//         </Link>
        
//         {/* Navigation principale */}
//         <ul className="navbar-nav">
//           <li>
//             <NavLink 
//               to="/events" 
//               className={({ isActive }) => isActive ? 'active' : ''}
//             >
//               Événements
//             </NavLink>
//           </li>
//           <li>
//             <NavLink 
//               to="/dashboard" 
//               className={({ isActive }) => isActive ? 'active' : ''}
//             >
//               Dashboard
//             </NavLink>
//           </li>
          
//           {/* Lien admin - création d'événement */}
//           {user?.role === 'admin' && (
//             <li>
//               <NavLink 
//                 to="/events/create" 
//                 className={({ isActive }) => isActive ? 'active' : ''}
//               >
//                 Créer un événement
//               </NavLink>
//             </li>
//           )}
//         </ul>
        
//         {/* Informations utilisateur et déconnexion */}
//         <div className="navbar-user">
//           <div className="user-info">
//             {/* Avatar avec initiale */}
//             <div className="user-avatar">
//               {user?.username?.charAt(0).toUpperCase() || 'U'}
//             </div>
//             <div>
//               <div className="user-name">{user?.username}</div>
//               <div className="user-role">
//                 {user?.role === 'admin' ? (
//                   <span className="badge badge-admin">Admin</span>
//                 ) : (
//                   'Utilisateur'
//                 )}
//               </div>
//             </div>
//           </div>
          
//           {/* Bouton de déconnexion */}
//           <button 
//             onClick={handleLogout} 
//             className="btn btn-secondary btn-sm"
//           >
//             Déconnexion
//           </button>
//         </div>
//       </div>
//     </nav>
//   )
// }

// export default Navbar



/**
 * ============================================================================
 * PLATEFORME INTELLIGENTE DE GESTION D'ÉVÉNEMENTS
 * Fichier : components/Navbar.jsx
 * Description : Barre de navigation principale
 * ============================================================================
 */

import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../redux/actions/authActions'

/**
 * Composant Navbar
 * Affiche la navigation principale avec les liens selon le rôle utilisateur
 */
function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  // Récupération de l'état d'authentification depuis Redux
  const { isAuthenticated, user } = useSelector(state => state.auth)
  
  /**
   * Gestion de la déconnexion
   */
  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }
  
  // Ne pas afficher la navbar si non authentifié
  if (!isAuthenticated) {
    return null
  }
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo / Marque */}
        <Link to="/events" className="navbar-brand">
          {/* Icône calendrier */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          MacroEve
        </Link>
        
        {/* Navigation principale */}
        <ul className="navbar-nav">
          <li>
            <NavLink 
              to="/events" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Événements
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Dashboard
            </NavLink>
          </li>
          
          {/* Lien admin - création d'événement */}
          {user?.role === 'admin' && (
            <li>
              <NavLink 
                to="/events/create" 
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                Créer un événement
              </NavLink>
            </li>
          )}
        </ul>
        
        {/* Informations utilisateur et déconnexion */}
        <div className="navbar-user">
          <div className="user-info">
            {/* Avatar avec initiale */}
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="user-name">{user?.username}</div>
              <div className="user-role">
                {user?.role === 'admin' ? (
                  <span className="badge badge-admin">Admin</span>
                ) : (
                  'Utilisateur'
                )}
              </div>
            </div>
          </div>
          
          {/* Bouton de déconnexion */}
          <button 
            onClick={handleLogout} 
            className="btn btn-secondary btn-sm"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar