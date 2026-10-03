import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Lenis from 'lenis';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './components/context/CartContext';
import { VALID_ROOMS } from './components/config/rooms';

import Preloader from './components/Preloader';
import CustomCursor from './components/CustomCursor';
import MobileCartFab from './components/MobileCartFab';
import ScrollToTop from './components/ScrollToTop';

import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

import Home from './components/Pages/Home';
import Admin from './components/Pages/Admin';
import AdminLogin from './components/Pages/AdminLogin';

function MainLayout() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomNumber = urlParams.get('room');

  const isInvalidRoomLink = roomNumber && !VALID_ROOMS.includes(roomNumber);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  if (isInvalidRoomLink) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center z-[99999] bg-brown-950">
        <AlertCircle className="w-20 h-20 text-gold-400 mb-6" />
        <h1 className="text-4xl font-serif font-bold text-cream-50 mb-4 tracking-widest uppercase">Invalid Access Link</h1>
        <p className="text-white/60 mb-8 max-w-md leading-relaxed text-sm font-light tracking-wide">
          The room number (<strong className="text-gold-400">{roomNumber}</strong>) specified in your URL is not recognized by our system. Please scan the correct QR code inside your room.
        </p>
        <button
          onClick={() => window.location.replace(window.location.pathname)}
          className="bg-gold-500 text-brown-950 text-[10px] uppercase tracking-[0.2em] px-8 py-4 font-bold shadow-lg hover:bg-gold-400 transition-colors active-scale"
        >
          Remove Room & Browse Public Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-brown-900 bg-cream-50">
      <Preloader />
      <CustomCursor />
      <Navbar />
      <CartDrawer />
      <MobileCartFab />
      <ScrollToTop />

      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#261309',
            color: '#f5d19d',
            border: '1px solid rgba(212, 168, 65, 0.2)',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            borderRadius: '0px',
            fontWeight: 'bold'
          },
        }}
      />

      <main className="flex-grow">
        <Home />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="/admin-login" element={<AdminLogin />} />
          </Routes>
        </Router>
      </CartProvider>
    </ErrorBoundary>
  );
}
