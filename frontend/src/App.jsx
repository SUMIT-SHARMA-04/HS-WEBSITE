import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Menu from './components/Menu';
import Booking from './components/Booking';
import Reviews from './components/Reviews';
import Order from './components/Order';
import Admin from './components/Admin';
import { About, Offers, Contact } from './components/HomeSections';
import './index.css';

const HomePage = () => (
  <>
    <section id="home" className="hero">
      <div className="container section visible">
        <h2>Experience Pure Veg Excellence</h2>
        <p>Authentic flavors, crafted with passion. Join us for an unforgettable culinary journey.</p>
        <a href="#menu" className="btn">Explore Our Menu</a>
      </div>
    </section>

    <main>
      <About />
      <Offers />
      <div className="container">
        <Menu />
      </div>
      <Booking />
      <div className="container">
        <Reviews />
      </div>
      <Contact />
    </main>
  </>
);

export default function App() {
  const [scrollWidth, setScrollWidth] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollWidth(pct);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <CartProvider>
      <Router>
        <div id="scroll-progress" style={{ width: `${scrollWidth}%` }}></div>
        
        <Navbar />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={<Order />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>

        <footer className="main-footer">
          <p>&copy; 2026 High Spirits Cafe. All rights reserved.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
            <Link to="/admin">Owner Dashboard</Link>
          </p>
        </footer>
      </Router>
    </CartProvider>
  );
}