import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { CartProvider } from './context/CartContext';

// --- COMPONENTS ---
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';

// --- PAGES ---
import Home from './pages/Home';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';

function MainLayout() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomNumber = urlParams.get('room');
  
  // STRICT WHITELIST
  const VALID_ROOMS = ['101', '102', '103', '104', '105', '106', '107', '108'];
  const isInvalidRoomLink = roomNumber && !VALID_ROOMS.includes(roomNumber);

  // =========================================================================
  // THE ROOT TRAP: If the room is invalid, return ONLY this error screen. 
  // The rest of the website is completely destroyed and hidden from the browser.
  // =========================================================================
  if (isInvalidRoomLink) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center p-6 text-center z-[99999]">
        <AlertCircle className="w-20 h-20 text-red-500 mb-6 animate-bounce" />
        <h1 className="text-4xl font-serif font-bold text-brown-900 mb-4">Invalid Access Link</h1>
        <p className="text-brown-600 mb-8 max-w-md leading-relaxed text-lg">
          The room number (<strong className="text-red-600">{roomNumber}</strong>) specified in your URL is not recognized by our system. Please scan the correct QR code inside your room.
        </p>
        <button 
          onClick={() => window.location.replace(window.location.pathname)} 
          className="bg-brown-900 text-gold-400 px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-brown-800 transition-colors"
        >
          Remove Room & Browse Public Menu
        </button>
      </div>
    );
  }

  // If the link is valid (or if they are a standard Walk-in guest), render the website
  return (
    <div className="min-h-screen bg-cream-50 font-sans text-brown-900">
      <Navbar />
      <CartDrawer />
      <main>
        <Home />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Public Customer Website */}
          <Route path="/" element={<MainLayout />} />
          
          {/* Secure Admin Portal Routes */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}