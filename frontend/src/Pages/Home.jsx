import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Menu from '@/components/Menu';
import Booking from '@/components/Booking';
import Reviews from '@/components/Reviews';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="bg-cream-50 text-brown-900 overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Menu />
        <Booking />
        <Reviews />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
