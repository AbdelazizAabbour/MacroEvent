import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchParticipations } from '../redux/actions/participationsActions'
import Alert from '../components/Alert'


function Dashboard() {
  const dispatch = useDispatch()
  
  // États Redux
  const { user, stats } = useSelector(state => state.auth)
  const { participations, loading, error } = useSelector(state => state.participations)
  
  // Chargement des participations de l'utilisateur
  useEffect(() => {
    dispatch(fetchParticipations())
  }, [dispatch])
  

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  
  const getStatusBadgeClass = (status) => {
    const classes = {
      'ouvrir': 'badge-open',
      'complète': 'badge-full',
      'annulé': 'badge-cancelled',
      'complété': 'badge-completed'
    }
    return `badge ${classes[status] || 'badge-open'}`
  }
  
  // Séparer les événements à venir et passés
  const now = new Date()
  const upcomingEvents = participations.filter(p => new Date(p.event_date) >= now)
  const pastEvents = participations.filter(p => new Date(p.event_date) < now)
  
  return (
    <div>
      {/* En-tête */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Bonjour, {user?.username} ! 
          {user?.role === 'admin' && <span className="badge badge-admin" style={{ marginLeft: 12 }}>Admin</span>}
        </h1>
        <p className="dashboard-subtitle">
          Bienvenue sur votre tableau de bord
        </p>
      </div>
      
      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.participations || 0}</div>
          <div className="stat-label">Événements inscrits</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.evaluations || 0}</div>
          <div className="stat-label">Évaluations données</div>
        </div>
        
        {/* Stats admin */}
        {user?.role === 'admin' && (
          <>
            <div className="stat-card">
              <div className="stat-value">{stats?.events_created || 0}</div>
              <div className="stat-label">Événements créés</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.total_users || 0}</div>
              <div className="stat-label">Utilisateurs total</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.total_events || 0}</div>
              <div className="stat-label">Événements total</div>
            </div>
          </>
        )}
      </div>
      
      {/* Erreur */}
      {error && <Alert type="error" message={error} />}
      
      {/* Chargement */}
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}
      
      {/* Événements à venir */}
      {!loading && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h2 className="card-title">Mes événements à venir ({upcomingEvents.length})</h2>
          </div>
          <div className="card-body">
            {upcomingEvents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {upcomingEvents.map(participation => (
                  <div 
                    key={participation.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 16,
                      background: 'var(--gray-50)',
                      borderRadius: 'var(--border-radius)',
                      flexWrap: 'wrap',
                      gap: 12
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, marginBottom: 4, fontSize: '1rem' }}>
                        {participation.event_title}
                      </h3>
                      <p style={{ margin: 0, color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                        {formatDate(participation.event_date)} • {participation.location}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className={getStatusBadgeClass(participation.event_status)}>
                        {participation.event_status}
                      </span>
                      <Link 
                        to={`/events/${participation.event_id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Voir
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 32 }}>
                <p>Vous n'êtes inscrit à aucun événement à venir.</p>
                <Link to="/events" className="btn btn-primary">
                  Découvrir les événements
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Événements passés */}
      {!loading && pastEvents.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Événements passés ({pastEvents.length})</h2>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pastEvents.slice(0, 5).map(participation => (
                <div 
                  key={participation.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 16,
                    background: 'var(--gray-50)',
                    borderRadius: 'var(--border-radius)',
                    opacity: 0.8,
                    flexWrap: 'wrap',
                    gap: 12
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, marginBottom: 4, fontSize: '1rem' }}>
                      {participation.event_title}
                    </h3>
                    <p style={{ margin: 0, color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                      {formatDate(participation.event_date)}
                    </p>
                  </div>
                  <Link 
                    to={`/events/${participation.event_id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    Voir / Évaluer
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Actions rapides pour admin */}
      {user?.role === 'admin' && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header">
            <h2 className="card-title">Actions administrateur</h2>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/events/create" className="btn btn-primary">
                Créer un événement
              </Link>
              <Link to="/events" className="btn btn-secondary">
                Gérer les événements
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
