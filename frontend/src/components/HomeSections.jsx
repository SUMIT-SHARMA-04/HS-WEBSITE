import React from 'react';

export const About = () => (
  <section id="about" className="section container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
    <div>
      <img 
        src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80" 
        alt="Classic Restaurant Interior" 
        style={{ width: '100%', borderRadius: '12px', boxShadow: '0 20px 40px rgba(74, 51, 32, 0.15)' }} 
      />
    </div>
    <div>
      <h2 className="page-title" style={{ left: '0', transform: 'none', textAlign: 'left', display: 'block' }}>Our Story</h2>
      <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-light)' }}>
        Founded with a passion for authentic culinary traditions, High Spirits Cafe is a sanctuary for pure vegetarian dining. We believe in sourcing the freshest local ingredients and transforming them into masterpieces of flavor.
      </p>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-light)' }}>
        Whether you are craving street-style fast food, comforting curries, or traditional South Indian delicacies, our chefs craft every dish with love, precision, and an unwavering commitment to quality.
      </p>
    </div>
  </section>
);

export const Offers = () => (
  <section id="offers" className="section container">
    <h2 className="page-title">Exclusive Offers</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      <div className="offer-card">
        <h3>Happy Hour</h3>
        <p>Get 20% off on all Beverages and Snacks.</p>
        <span className="offer-time">Mon-Fri | 4 PM - 7 PM</span>
      </div>
      <div className="offer-card">
        <h3>Weekend Feast</h3>
        <p>Free Dessert on all dinner orders above ₹1500.</p>
        <span className="offer-time">Sat-Sun | 7 PM - 11 PM</span>
      </div>
      <div className="offer-card">
        <h3>Corporate Lunch</h3>
        <p>Special Thali combinations starting at just ₹250.</p>
        <span className="offer-time">Mon-Fri | 12 PM - 3 PM</span>
      </div>
    </div>
  </section>
);

export const Contact = () => (
  <section id="contact" className="section" style={{ background: 'var(--cream-dark)', padding: '5rem 5%', borderTop: '1px solid var(--border)' }}>
    <h2 className="page-title">Get in Touch</h2>
    <div className="contact-grid">
      <div className="contact-item">
        <div className="contact-icon">📍</div>
        <h4>Location</h4>
        <p>123 Culinary Avenue,<br/>Jaipur, Rajasthan 302001</p>
      </div>
      <div className="contact-item">
        <div className="contact-icon">📞</div>
        <h4>Contact</h4>
        <p>Phone: +91 98765 43210<br/>Email: hello@highspirits.com</p>
      </div>
      <div className="contact-item">
        <div className="contact-icon">⏰</div>
        <h4>Opening Hours</h4>
        <p>Monday - Sunday<br/>11:00 AM - 11:00 PM</p>
      </div>
      <div className="contact-item">
        <div className="contact-icon">📱</div>
        <h4>Follow Us</h4>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}>
          <a href="#" className="social-link">Instagram</a>
          <a href="#" className="social-link">Facebook</a>
          <a href="#" className="social-link">Twitter</a>
        </div>
      </div>
    </div>
  </section>
);