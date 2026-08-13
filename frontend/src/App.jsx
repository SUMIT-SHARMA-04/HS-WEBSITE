import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from '@/context/CartContext'; 

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Menu from '@/components/Menu';
import BookTable from "@/components/Booking";
import Offers from '@/components/Offers';
import Reviews from '@/components/Reviews';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Admin from '@/components/Admin';
// --- NEW: Import CartDrawer ---
import CartDrawer from '@/components/CartDrawer'; 

const LandingPage = () => (
  <>
    <Navbar />
    <Hero />
    <About />
    <Menu />
    <BookTable />
    <Offers />
    <Reviews />
    <Contact />
    <Footer />
    {/* --- NEW: Render CartDrawer here --- */}
    <CartDrawer />
  </>
);

export default function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}