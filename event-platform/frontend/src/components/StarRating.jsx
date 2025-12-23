
import React, { useState } from 'react'

/**
 * @param {Object} props
 * @param {number} props.rating 
 * @param {function} props.onRatingChange 
 * @param {boolean} props.readonly 
 * @param {string} props.size 
 */
function StarRating({ 
  rating = 0, 
  onRatingChange, 
  readonly = false,
  size = 'medium' 
}) {
  // État local pour le survol
  const [hoverRating, setHoverRating] = useState(0)
  
  // Nombre total d'étoiles
  const totalStars = 5
  
 
  const handleClick = (starIndex) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starIndex)
    }
  }
  

  const handleMouseEnter = (starIndex) => {
    if (!readonly) {
      setHoverRating(starIndex)
    }
  }

  const handleMouseLeave = () => {
    setHoverRating(0)
  }
  
 
  const isStarFilled = (starIndex) => {
    if (hoverRating > 0) {
      return starIndex <= hoverRating
    }
    return starIndex <= rating
  }
  
  const getStarSize = () => {
    switch (size) {
      case 'small': return 16
      case 'large': return 28
      default: return 20
    }
  }
  
  const starSize = getStarSize()
  
  return (
    <div 
      className="stars"
      onMouseLeave={handleMouseLeave}
    >
      {[...Array(totalStars)].map((_, index) => {
        const starIndex = index + 1
        const filled = isStarFilled(starIndex)
        
        return (
          <svg
            key={starIndex}
            className={`star ${filled ? 'filled' : ''} ${!readonly ? 'interactive' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={filled ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.5"
            width={starSize}
            height={starSize}
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            style={{ cursor: readonly ? 'default' : 'pointer' }}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        )
      })}
    </div>
  )
}

export default StarRating
