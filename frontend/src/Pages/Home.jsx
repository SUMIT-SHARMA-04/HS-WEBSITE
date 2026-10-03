import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import About from '@/components/About';
import Menu from '@/components/Menu';
import Offers from '@/components/Offers';
import Delivery from '@/components/Delivery';
import Booking from '@/components/Booking';
import EventPlanning from '@/components/EventPlanning';
import Reviews from '@/components/Reviews';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

export default function Home() {
  const { hotelRoom } = useCart();
  const isHotelGuest = !!hotelRoom;

  return (
    <div className="bg-cream-50 text-brown-900 overflow-x-clip">
      <main>
        <Hero />
        <Marquee />
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