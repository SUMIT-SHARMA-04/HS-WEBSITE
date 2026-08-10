import React, { useState } from 'react';

export default function Reviews() {
  const [rating, setRating] = useState(4);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');

  const handleStarClick = (value) => {
    setRating(value);
    setMessage(`Thank you for the ${value}-star rating! Your feedback fuels our excellence.`);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    setMessage(`Thank you! Your review has been submitted for moderation.`);
    e.target.reset();
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <section id="reviews" className="section visible" style={{ textAlign: 'center' }}>
      <h2 className="page-title">Rate Your Experience</h2>
      
      <div id="star-rating" onMouseLeave={() => setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
            onMouseEnter={() => setHoverRating(star)}
            onClick={() => handleStarClick(star)}
          >
            ★
          </span>
        ))}
      </div>

      {message && <div className="msg-box" style={{ display: 'block', maxWidth: '600px', margin: '1rem auto' }}>{message}</div>}
      
      <form onSubmit={handleReviewSubmit} style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <textarea 
          placeholder="Leave a detailed review (optional)..." 
          rows="4" 
          style={{ width: '100%', padding: '1rem', border: '1px solid var(--gold-light)', borderRadius: '4px', marginBottom: '1rem', fontFamily: 'inherit', resize: 'vertical' }} 
          required 
        />
        <button type="submit" className="btn">Submit Review</button>
      </form>
    </section>
  );
}