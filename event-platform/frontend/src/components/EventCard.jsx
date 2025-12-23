

import React from 'react'
import { Link } from 'react-router-dom'
import StarRating from './StarRating'

/**
 * Composant EventCard
 * Affiche les informations résumées d'un événement dans une carte
 * 
 * @param {Object} props
 * @param {Object} props.event 
 */
function EventCard({ event }) {
  /**
   * Formate une date pour l'affichage
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  /**
   * Retourne la classe CSS du badge selon le statut
   */
  const getStatusBadgeClass = (status) => {
    const classes = {
      'open': 'badge-open',
      'full': 'badge-full',
      'cancelled': 'badge-cancelled',
      'completed': 'badge-completed'
    }
    return `badge ${classes[status] || 'badge-open'}`
  }
  
  /**
   * Retourne le libellé du statut
   */
  const getStatusLabel = (status) => {
    const labels = {
      'open': 'Ouvert',
      'full': 'Complet',
      'cancelled': 'Annulé',
      'completed': 'Terminé'
    }
    return labels[status] || status
  }
  
  return (
    <div className="event-card">
      {/* En-tête avec titre et date */}
      <div className="event-card-header">
        <h3 className="event-card-title">{event.title}</h3>
        <p className="event-card-date">{formatDate(event.event_date)}</p>
      </div>
      
      {/* Corps de la carte */}
      <div className="event-card-body">
        {/* Description tronquée */}
        {event.description && (
          <p className="event-card-description">{event.description}</p>
        )}
        
        {/* Informations détaillées */}
        <div className="event-card-info">
          {/* Lieu */}
          <div className="event-info-item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {event.location}
          </div>
          
          {/* Participants */}
          <div className="event-info-item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            {event.current_participants} / {event.max_capacity} participants
          </div>
          
          {/* Note moyenne */}
          {event.total_ratings > 0 && (
            <div className="event-info-item">
              <StarRating rating={event.average_rating} readonly size="small" />
              <span className="rating-value">
                ({event.average_rating.toFixed(1)}) - {event.total_ratings} avis
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Pied de carte */}
      <div className="event-card-footer">
        <span className={getStatusBadgeClass(event.status)}>
          {getStatusLabel(event.status)}
        </span>
        
        <Link to={`/events/${event.id}`} className="btn btn-primary btn-sm">
          Voir les détails
        </Link>
      </div>
    </div>
  )
}

export default EventCard
