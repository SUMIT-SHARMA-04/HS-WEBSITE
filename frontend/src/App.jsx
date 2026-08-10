import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Menu from './components/Menu';
import Booking from './components/Booking';
import Reviews from './components/Reviews';
import Order from './components/Order';
import Admin from './components/Admin';
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

    <main className="container">
      <Menu />
      <Booking />
      <Reviews />
    </main>
  </>
);

// We create a wrapper component to handle the layout logic
const AppLayout = () => {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';
  const [scrollWidth, setScrollWidth] = useState(0);

  useEffect(() => {
    if (isAdminPage) return; // Don't run scroll logic on the admin page
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollWidth(pct);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdminPage]);

  return (
    <>
      {/* Only render customer navigation if NOT on the admin page */}
      {!isAdminPage && (
        <>
          <div id="scroll-progress" style={{ width: `${scrollWidth}%` }}></div>
          <Navbar />
        </>
      )}
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<Order />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>

      {/* Only render customer footer if NOT on the admin page */}
      {!isAdminPage && (
        <footer className="main-footer">
          <p>&copy; 2026 High Spirits Cafe. All rights reserved.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
            <a href="/admin">Owner Dashboard</a>
          </p>
        </footer>
      )}
    </>
  );
};

export default function App() {
  return (
    <CartProvider>
      <Router>
        <AppLayout />
      </Router>
    </CartProvider>
  );
}