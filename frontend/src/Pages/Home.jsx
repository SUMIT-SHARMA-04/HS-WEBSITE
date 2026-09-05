import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Menu from '@/components/Menu';
import Offers from '@/components/Offers'; // The file remains Offers.jsx, but it acts as Combos visually
import Delivery from '@/components/Delivery';
import Booking from '@/components/Booking';
import EventPlanning from '@/components/EventPlanning'; // New component
import Reviews from '@/components/Reviews';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  const urlParams = new URLSearchParams(window.location.search);
  const isHotelGuest = urlParams.has('room');

  return (
    <div className="bg-cream-50 text-brown-900 overflow-x-hidden">
      <Navbar />
      <main>
        {/* Ordered exactly as requested */}
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