import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEvent, clearCurrentEvent } from '../redux/actions/eventsActions'
import { registerToEvent, cancelParticipation } from '../redux/actions/participationsActions'
import { createEvaluation } from '../redux/actions/evaluationsActions'
import StarRating from '../components/StarRating'
import Alert from '../components/Alert'

function EventDetails() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const [message, setMessage] = useState({ type: '', text: '' })
  const [evaluationForm, setEvaluationForm] = useState({ rating: 0, comment: '' })
  
  const { user } = useSelector(state => state.auth)
  const { currentEvent: event, participants, evaluations, userParticipation, userEvaluation, loading, error } = useSelector(state => state.events)
  const { loading: participationLoading } = useSelector(state => state.participations)
  const { loading: evaluationLoading } = useSelector(state => state.evaluations)
  
  useEffect(() => {
    dispatch(fetchEvent(id))
    return () => dispatch(clearCurrentEvent())
  }, [dispatch, id])
  
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }
  
  const getStatusBadgeClass = (status) => {
    const classes = { 'open': 'badge-open', 'full': 'badge-full', 'cancelled': 'badge-cancelled', 'completed': 'badge-completed' }
    return `badge ${classes[status] || 'badge-open'}`
  }
  
  const handleRegister = async () => {
    const result = await dispatch(registerToEvent(event.id))
    if (result.success) {
      setMessage({ type: 'success', text: result.message })
      dispatch(fetchEvent(id))
    } else {
      setMessage({ type: 'error', text: result.error })
    }
  }
  
  const handleCancelParticipation = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler votre participation ?')) return
    const result = await dispatch(cancelParticipation(event.id))
    if (result.success) {
      setMessage({ type: 'success', text: result.message })
      dispatch(fetchEvent(id))
    } else {
      setMessage({ type: 'error', text: result.error })
    }
  }
  
  const handleSubmitEvaluation = async (e) => {
    e.preventDefault()
    if (evaluationForm.rating === 0) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une note' })
      return
    }
    const result = await dispatch(createEvaluation({ event_id: event.id, rating: evaluationForm.rating, comment: evaluationForm.comment }))
    if (result.success) {
      setMessage({ type: 'success', text: result.message })
      setEvaluationForm({ rating: 0, comment: '' })
      dispatch(fetchEvent(id))
    } else {
      setMessage({ type: 'error', text: result.error })
    }
  }
  
  if (loading) return <div className="loading"><div className="spinner"></div></div>
  if (error) return <div className="empty-state"><h2 className="empty-state-title">Erreur</h2><p>{error}</p><button className="btn btn-primary" onClick={() => navigate('/events')}>Retour</button></div>
  if (!event) return <div className="empty-state"><h2 className="empty-state-title">Événement non trouvé</h2><button className="btn btn-primary" onClick={() => navigate('/events')}>Retour</button></div>
  
  const isRegistered = userParticipation?.status === 'registered'
  const hasEvaluated = !!userEvaluation
  const canRegister = event.status === 'open' && !event.is_full && !isRegistered
  const canEvaluate = isRegistered && !hasEvaluated
  
  return (
    <div className="event-detail">
      <div className="event-detail-header">
        <h1 className="event-detail-title">{event.title}</h1>
        <div className="event-detail-meta">
          <span>{formatDate(event.event_date)}</span>
          <span>•</span>
          <span>{event.location}</span>
          <span>•</span>
          <span className={getStatusBadgeClass(event.status)}>{event.status_label || event.status}</span>
        </div>
      </div>
      
      <div className="event-detail-content">
        {message.text && <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: '', text: '' })} />}
        
        <section className="event-section">
          <h2 className="event-section-title">Description</h2>
          <p>{event.description || 'Aucune description disponible.'}</p>
        </section>
        
        <section className="event-section">
          <h2 className="event-section-title">Informations</h2>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-value">{event.current_participants}</div><div className="stat-label">Participants</div></div>
            <div className="stat-card"><div className="stat-value">{event.available_spots}</div><div className="stat-label">Places disponibles</div></div>
            <div className="stat-card"><div className="stat-value">{event.max_capacity}</div><div className="stat-label">Capacité max</div></div>
            <div className="stat-card"><div className="stat-value">{event.average_rating > 0 ? event.average_rating.toFixed(1) : '-'}</div><div className="stat-label">Note ({event.total_ratings} avis)</div></div>
          </div>
        </section>
        
        <section className="event-section">
          <h2 className="event-section-title">Participation</h2>
          {isRegistered ? (
            <div>
              <Alert type="success" message="Vous êtes inscrit à cet événement" />
              <button className="btn btn-danger" onClick={handleCancelParticipation} disabled={participationLoading}>
                {participationLoading ? 'Annulation...' : 'Annuler ma participation'}
              </button>
            </div>
          ) : canRegister ? (
            <button className="btn btn-success btn-lg" onClick={handleRegister} disabled={participationLoading}>
              {participationLoading ? 'Inscription...' : 'S\'inscrire à cet événement'}
            </button>
          ) : (
            <Alert type="warning" message={
              event.status === 'cancelled' ? 'Cet événement a été annulé' :
              event.status === 'completed' ? 'Cet événement est terminé' :
              event.is_full ? 'Cet événement est complet' : 'Inscription non disponible'
            } />
          )}
        </section>
        
        {participants.length > 0 && (
          <section className="event-section">
            <h2 className="event-section-title">Participants ({participants.length})</h2>
            <div className="participants-list">
              {participants.map(p => (
                <span key={p.id} className="participant-badge">
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                    {p.username.charAt(0).toUpperCase()}
                  </span>
                  {p.username}
                </span>
              ))}
            </div>
          </section>
        )}
        
        {canEvaluate && (
          <section className="event-section">
            <h2 className="event-section-title">Évaluer cet événement</h2>
            <form onSubmit={handleSubmitEvaluation}>
              <div className="form-group">
                <label className="form-label">Votre note</label>
                <StarRating rating={evaluationForm.rating} onRatingChange={(r) => setEvaluationForm(prev => ({ ...prev, rating: r }))} size="large" />
              </div>
              <div className="form-group">
                <label htmlFor="comment" className="form-label">Votre commentaire (optionnel)</label>
                <textarea id="comment" value={evaluationForm.comment} onChange={(e) => setEvaluationForm(prev => ({ ...prev, comment: e.target.value }))} className="form-textarea" placeholder="Partagez votre expérience..." />
              </div>
              <button type="submit" className="btn btn-primary" disabled={evaluationLoading}>
                {evaluationLoading ? 'Envoi...' : 'Envoyer mon évaluation'}
              </button>
            </form>
          </section>
        )}
        
        {evaluations.length > 0 && (
          <section className="event-section">
            <h2 className="event-section-title">Évaluations ({evaluations.length})</h2>
            {evaluations.map(ev => (
              <div key={ev.id} className="evaluation-card">
                <div className="evaluation-header">
                  <div>
                    <span className="evaluation-author">{ev.username}</span>
                    <StarRating rating={ev.rating} readonly size="small" />
                  </div>
                  <span className="evaluation-date">{new Date(ev.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                {ev.comment && <p className="evaluation-comment">{ev.comment}</p>}
              </div>
            ))}
          </section>
        )}
        
        <div style={{ marginTop: 32 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/events')}>← Retour aux événements</button>
        </div>
      </div>
    </div>
  )
}

export default EventDetails
