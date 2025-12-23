import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { login, clearError } from '../redux/actions/authActions'
import Alert from '../components/Alert'

function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  
  // État du formulaire
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  
  // État de l'interface
  const [formErrors, setFormErrors] = useState({})
  
  // État Redux
  const { loading, error, isAuthenticated } = useSelector(state => state.auth)
  
  // Redirection après connexion
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/events'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])
  
  // Nettoyage des erreurs au démontage
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Effacer l'erreur du champ modifié
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }
  

  const validateForm = () => {
    const errors = {}
    
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email invalide'
    }
    
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  /**
   * Gère la soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    const result = await dispatch(login(formData))
    
    if (result.success) {
      // La redirection est gérée par le useEffect
    }
  }
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* En-tête */}
        <h1 className="auth-title">Connexion</h1>
        <p className="auth-subtitle">
          Connectez-vous pour accéder à la plateforme
        </p>
        
        {/* Message d'erreur */}
        {error && <Alert type="error" message={error} />}
        
        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          {/* Champ Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${formErrors.email ? 'error' : ''}`}
              placeholder="votre@email.com"
              autoComplete="email"
            />
            {formErrors.email && (
              <span className="form-error">{formErrors.email}</span>
            )}
          </div>
          
          {/* Champ Mot de passe */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${formErrors.password ? 'error' : ''}`}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {formErrors.password && (
              <span className="form-error">{formErrors.password}</span>
            )}
          </div>
          
          {/* Bouton de connexion */}
          <button 
            type="submit" 
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
        
        {/* Lien vers inscription */}
        <p className="auth-footer">
          Pas encore de compte ?{' '}
          <Link to="/register">Inscrivez-vous</Link>
          
        </p>
      </div>
    </div>
  )
}

export default Login


