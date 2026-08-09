import React, { useState } from 'react';
import axios from 'axios';

export default function Booking() {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    date: '',
    time: '',
    guests: 1
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    try {
      await axios.post('http://localhost:8000/api/bookings/', formData);
      setMessage(`Reservation Confirmed! Thank you, ${formData.customer_name}.`);
      setFormData({ customer_name: '', customer_phone: '', date: '', time: '', guests: 1 }); // Reset form
      
      // Hide message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage("Error connecting to the server. Please try again.");
    }
  };

  return (
    <section id="book" className="section visible">
      <h2 className="page-title">Reserve a Table</h2>
      
      <form className="form-grid" onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Full Name" 
          value={formData.customer_name}
          onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
          required 
        />
        <input 
          type="tel" 
          placeholder="Phone Number" 
          value={formData.customer_phone}
          onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
          required 
        />
        <input 
          type="date" 
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
          required 
        />
        <input 
          type="time" 
          value={formData.time}
          onChange={(e) => setFormData({...formData, time: e.target.value})}
          required 
        />
        <input 
          type="number" 
          min="1" max="20" 
          placeholder="Number of Guests" 
          className="full-width" 
          value={formData.guests}
          onChange={(e) => setFormData({...formData, guests: e.target.value})}
          required 
        />
        <button type="submit" className="btn full-width">Confirm Reservation</button>
      </form>

      {message && (
        <div className="msg-box" style={{ display: 'block' }}>
          <strong>{message}</strong>
        </div>
      )}
    </section>
  );
}