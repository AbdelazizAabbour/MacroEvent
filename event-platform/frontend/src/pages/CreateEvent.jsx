import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createEvent } from '../redux/actions/eventsActions'
import Alert from '../components/Alert'


function CreateEvent() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  // État du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    max_capacity: 50
  })
  
  // États de l'interface
  const [formErrors, setFormErrors] = useState({})
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // État Redux
  const { loading } = useSelector(state => state.events)
  
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
    
    if (!formData.title.trim()) {
      errors.title = 'Le titre est requis'
    } else if (formData.title.length < 3) {
      errors.title = 'Le titre doit contenir au moins 3 caractères'
    }
    
    if (!formData.event_date) {
      errors.event_date = 'La date est requise'
    }
    
    if (!formData.event_time) {
      errors.event_time = 'L\'heure est requise'
    }
    
    // Vérifier que la date est dans le futur
    if (formData.event_date && formData.event_time) {
      const eventDateTime = new Date(`${formData.event_date}T${formData.event_time}`)
      if (eventDateTime <= new Date()) {
        errors.event_date = 'La date doit être dans le futur'
      }
    }
    
    if (!formData.location.trim()) {
      errors.location = 'Le lieu est requis'
    }
    
    if (!formData.max_capacity || formData.max_capacity < 1) {
      errors.max_capacity = 'La capacité doit être d\'au moins 1'
    } else if (formData.max_capacity > 10000) {
      errors.max_capacity = 'La capacité ne peut pas dépasser 10000'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }
  

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    // Combiner date et heure
    const eventData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      event_date: `${formData.event_date} ${formData.event_time}:00`,
      location: formData.location.trim(),
      max_capacity: parseInt(formData.max_capacity)
    }
    
    const result = await dispatch(createEvent(eventData))
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Événement créé avec succès !' })
      
      // Rediriger vers la page de l'événement après 1.5 secondes
      setTimeout(() => {
        navigate(`/events/${result.event.id}`)
      }, 1500)
    } else {
      setMessage({ type: 'error', text: result.error })
    }
  }
  

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }
  
  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* En-tête */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Créer un événement</h1>
        <p className="dashboard-subtitle">
          Remplissez le formulaire pour créer un nouvel événement
        </p>
      </div>
      
      {/* Formulaire */}
      <div className="card">
        <div className="card-body">
          {/* Messages */}
          {message.text && (
            <Alert 
              type={message.type} 
              message={message.text} 
              onClose={() => setMessage({ type: '', text: '' })}
            />
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Titre */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Titre de l'événement *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`form-input ${formErrors.title ? 'error' : ''}`}
                placeholder="Ex: Conférence Tech 2025"
                maxLength={200}
              />
              {formErrors.title && (
                <span className="form-error">{formErrors.title}</span>
              )}
            </div>
            
            {/* Description */}
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Décrivez votre événement..."
                rows={4}
              />
            </div>
            
            {/* Date et heure */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label htmlFor="event_date" className="form-label">
                  Date *
                </label>
                <input
                  type="date"
                  id="event_date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleChange}
                  className={`form-input ${formErrors.event_date ? 'error' : ''}`}
                  min={getMinDate()}
                />
                {formErrors.event_date && (
                  <span className="form-error">{formErrors.event_date}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="event_time" className="form-label">
                  Heure *
                </label>
                <input
                  type="time"
                  id="event_time"
                  name="event_time"
                  value={formData.event_time}
                  onChange={handleChange}
                  className={`form-input ${formErrors.event_time ? 'error' : ''}`}
                />
                {formErrors.event_time && (
                  <span className="form-error">{formErrors.event_time}</span>
                )}
              </div>
            </div>
            
            {/* Lieu */}
            <div className="form-group">
              <label htmlFor="location" className="form-label">
                Lieu *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`form-input ${formErrors.location ? 'error' : ''}`}
                placeholder="Ex: Paris Convention Center"
              />
              {formErrors.location && (
                <span className="form-error">{formErrors.location}</span>
              )}
            </div>
            
            {/* Capacité */}
            <div className="form-group">
              <label htmlFor="max_capacity" className="form-label">
                Capacité maximale *
              </label>
              <input
                type="number"
                id="max_capacity"
                name="max_capacity"
                value={formData.max_capacity}
                onChange={handleChange}
                className={`form-input ${formErrors.max_capacity ? 'error' : ''}`}
                min={1}
                max={10000}
              />
              {formErrors.max_capacity && (
                <span className="form-error">{formErrors.max_capacity}</span>
              )}
            </div>
            
            {/* Boutons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button 
                type="submit" 
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? 'Création...' : 'Créer l\'événement'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate('/events')}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateEvent
