import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEvents } from '../redux/actions/eventsActions'
import EventCard from '../components/EventCard'
import Alert from '../components/Alert'

function Events() {
  const dispatch = useDispatch()
  
  // État local pour les filtres
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  })
  
  // État Redux
  const { events, pagination, loading, error } = useSelector(state => state.events)
  
  // Chargement initial des événements
  useEffect(() => {
    dispatch(fetchEvents())
  }, [dispatch])
  
 
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
 
  const handleApplyFilters = (e) => {
    e.preventDefault()
    dispatch(fetchEvents({
      status: filters.status || undefined,
      search: filters.search || undefined
    }))
  }
  

  const handleResetFilters = () => {
    setFilters({ status: '', search: '' })
    dispatch(fetchEvents())
  }
  

  const handlePageChange = (page) => {
    dispatch(fetchEvents({
      ...filters,
      page
    }))
  }
  
  return (
    <div>
      {/* En-tête de la page */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Événements</h1>
        <p className="dashboard-subtitle">
          Découvrez et participez aux événements à venir
        </p>
      </div>
      
      {/* Filtres */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-body">
          <form onSubmit={handleApplyFilters} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {/* Recherche */}
            <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
              <label htmlFor="search" className="form-label">Rechercher</label>
              <input
                type="text"
                id="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="form-input"
                placeholder="Titre, description, lieu..."
              />
            </div>
            
            {/* Filtre par statut */}
            <div className="form-group" style={{ minWidth: '150px', marginBottom: 0 }}>
              <label htmlFor="status" className="form-label">Statut</label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="">Tous</option>
                <option value="open">Ouvert</option>
                <option value="full">Complet</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
            
            {/* Boutons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn btn-primary">
                Filtrer
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleResetFilters}
              >
                Réinitialiser
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Message d'erreur */}
      {error && <Alert type="error" message={error} />}
      
      {/* Chargement */}
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}
      
      {/* Liste des événements */}
      {!loading && events.length > 0 && (
        <>
          <div className="events-grid">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '8px', 
              marginTop: '32px' 
            }}>
              <button
                className="btn btn-secondary"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Précédent
              </button>
              
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '0 16px',
                color: 'var(--gray-600)'
              }}>
                Page {pagination.page} sur {pagination.total_pages}
              </span>
              
              <button
                className="btn btn-secondary"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.total_pages}
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
      
      {/* État vide */}
      {!loading && events.length === 0 && (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
          </svg>
          <h2 className="empty-state-title">Aucun événement trouvé</h2>
          <p>Il n'y a pas encore d'événements correspondant à vos critères.</p>
        </div>
      )}
    </div>
  )
}

export default Events
