import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Menu from '@/components/Menu';
import Offers from '@/components/Offers';
import Delivery from '@/components/Delivery';
import Booking from '@/components/Booking';
import EventPlanning from '@/components/EventPlanning';
import Reviews from '@/components/Reviews';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { AlertTriangle, QrCode } from 'lucide-react';

const VALID_ROOMS = ['101', '102', '103', '104', '105', '106', '107', '108'];

export default function Home() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomParam = urlParams.get('room');
  
  // STRICT BLOCK: If the URL has a room parameter, but it's fake/invalid
  if (roomParam && !VALID_ROOMS.includes(roomParam)) {
    // FIX: Using w-screen, h-screen, and fixed inset-0 to physically overwrite the entire webpage
    return (
      <div className="w-screen h-screen fixed inset-0 z-[99999] bg-brown-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full border border-red-100 relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-brown-900 mb-4">Invalid Room QR</h1>
          <p className="text-brown-600 mb-8 leading-relaxed">
            This room number is not recognized by our system. Please rescan the official QR code located in your hotel room to order.
          </p>
          <div className="flex justify-center">
             <QrCode className="w-12 h-12 text-brown-300 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const isHotelGuest = !!roomParam;

  return (
    <div className="bg-cream-50 text-brown-900 overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Menu />
        <Offers />
        {!isHotelGuest && <Delivery />}
        <Booking />
        <EventPlanning />
        <Reviews />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}