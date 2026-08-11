import React, { useState } from 'react';

export default function Booking() {
  const [formData, setFormData] = useState({
    customer_name: '', customer_phone: '', date: '', time: '', guests: 1
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/bookings/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setMessage(`Reservation Confirmed! Thank you, ${formData.customer_name}.`);
        setFormData({ customer_name: '', customer_phone: '', date: '', time: '', guests: 1 });
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      setMessage("Error connecting to the server. Please try again.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="book" className="section visible parallax-booking">
      <div className="glass-card">
        <h2 className="page-title" style={{ color: 'var(--gold)' }}>Reserve a Table</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <input type="text" name="customer_name" placeholder="Full Name" value={formData.customer_name} onChange={handleChange} required />
          <input type="tel" name="customer_phone" placeholder="Phone Number" value={formData.customer_phone} onChange={handleChange} required />
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          <input type="time" name="time" value={formData.time} onChange={handleChange} required />
          <input type="number" name="guests" min="1" max="20" placeholder="Number of Guests" className="full-width" value={formData.guests} onChange={handleChange} required />
          <button type="submit" className="btn full-width">Confirm Reservation</button>
        </form>
        {message && <div className="msg-box" style={{ display: 'block', marginTop: '1rem' }}>{message}</div>}
      </div>
    </section>
  );
}