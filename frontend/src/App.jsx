import React from 'react';
import { CartProvider, useCart } from './context/CartContext';
import Menu from './components/Menu';
import Booking from './components/Booking';
import Reviews from './components/Reviews';
import './index.css'; // Paste ALL the CSS from your HTML file here

const Navbar = () => {
  const { cart } = useCart();
  
  return (
    <header className="top-header">
      <h1>High Spirits</h1>
      <nav className="nav-links">
        <a href="#home">Home</a>
        <a href="#menu">Menu</a>
        <a href="#book">Book Table</a>
        <a href="/cart" className="cart-link">
          🛒 Cart (<span id="cart-count">{cart.length}</span>)
        </a>
      </nav>
    </header>
  );
};

export default function App() {
  return (
    <CartProvider>
      <Navbar />
      
      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="container section visible">
          <h2>Experience Pure Veg Excellence</h2>
          <p>Authentic flavors, crafted with passion. Join us for an unforgettable culinary journey.</p>
          <a href="#menu" className="btn">Explore Our Menu</a>
        </div>
      </section>

      <main className="container">
        <Menu />
        <Booking />
        <Reviews />
      </main>

      <footer className="main-footer">
        <p>&copy; 2026 High Spirits Cafe. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
          <a href="/admin">Owner Dashboard</a>
        </p>
      </footer>
    </CartProvider>
  );
}