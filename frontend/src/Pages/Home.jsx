import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Menu from '@/components/Menu';
import Delivery from '@/components/Delivery';
import Booking from '@/components/Booking';
import Reviews from '@/components/Reviews';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  // Determine if the user is a hotel guest based on the URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const isHotelGuest = urlParams.has('room');

  return (
    <div className="bg-cream-50 text-brown-900 overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Menu />
        
        {/* Hide online delivery services if accessed from a hotel room */}
        {!isHotelGuest && <Delivery />}
        
        <Booking />
        <Reviews />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}