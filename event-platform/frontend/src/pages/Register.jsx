import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { register, clearError } from '../redux/actions/authActions'
import Alert from '../components/Alert'


function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  // État du formulaire
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  // État de l'interface
  const [formErrors, setFormErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  
  // État Redux
  const { loading, error, registerSuccess } = useSelector(state => state.auth)
  
  // Redirection après inscription réussie
  useEffect(() => {
    if (registerSuccess) {
      setSuccessMessage('Inscription réussie ! Redirection vers la page de connexion...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    }
  }, [registerSuccess, navigate])
  
  // Nettoyage au démontage
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
    
    // Validation du nom d'utilisateur
    if (!formData.username.trim()) {
      errors.username = 'Le nom d\'utilisateur est requis'
    } else if (formData.username.length < 3) {
      errors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Seules les lettres, chiffres et underscores sont autorisés'
    }
    
    // Validation de l'email
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email invalide'
    }
    
    // Validation du mot de passe
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis'
    } else if (formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    }
    
    // Confirmation du mot de passe
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Veuillez confirmer le mot de passe'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }
  
 
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    // Envoi des données (sans confirmPassword)
    const { confirmPassword, ...userData } = formData
    await dispatch(register(userData))
  }
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* En-tête */}
        <h1 className="auth-title">Inscription</h1>
        <p className="auth-subtitle">
          Créez votre compte pour rejoindre la plateforme
        </p>
        
        {/* Messages */}
        {error && <Alert type="error" message={error} />}
        {successMessage && <Alert type="success" message={successMessage} />}
        
        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          {/* Champ Nom d'utilisateur */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`form-input ${formErrors.username ? 'error' : ''}`}
              placeholder="votre_pseudo"
              autoComplete="username"
            />
            {formErrors.username && (
              <span className="form-error">{formErrors.username}</span>
            )}
          </div>
          
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
              autoComplete="new-password"
            />
            {formErrors.password && (
              <span className="form-error">{formErrors.password}</span>
            )}
          </div>
          
          {/* Champ Confirmation mot de passe */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${formErrors.confirmPassword ? 'error' : ''}`}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {formErrors.confirmPassword && (
              <span className="form-error">{formErrors.confirmPassword}</span>
            )}
          </div>
          
          {/* Bouton d'inscription */}
          <button 
            type="submit" 
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </form>
        
        {/* Lien vers connexion */}
        <p className="auth-footer">
          Déjà un compte ?{' '}
          <Link to="/login">Connectez-vous</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
