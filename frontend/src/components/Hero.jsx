import { useEffect, useState, useRef } from 'react';
import { Smartphone, UtensilsCrossed, Heart, Star, Users } from 'lucide-react';
import MagneticButton from './MagneticButton';
import useReveal from '@/hooks/useReveal';

const heroStats = [
  { icon: Star, num: '4.9', label: 'Average Rating' },
  { icon: Users, num: '2K+', label: 'Guests Served' },
  { icon: UtensilsCrossed, num: '120+', label: 'Menu Items' },
];

export default function Hero() {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isMobile, setIsMobile] = useState(false);
  const heroRef = useRef(null);

  const bgImage = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&h=1080&w=1920';

  useReveal();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      setIsMobile(true);
    }
  }, []);

  const handleMouseMove = (e) => {
    if (isMobile || !heroRef.current) return;
    const { left, top } = heroRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - left, y: e.clientY - top });
  };

  const handleMouseLeave = () => setMousePos({ x: -1000, y: -1000 });

  return (
    <section
      id="home"
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brown-950"
    >
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center opacity-30 grayscale-[80%] scale-105"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brown-950 via-brown-950/80 to-brown-950/40" />
      </div>

      {/* Circular spotlight that follows the cursor, revealing the full-color image underneath */}
      {!isMobile && (
        <div
          className="absolute inset-0 z-0 pointer-events-none transition-[clip-path] duration-75 ease-out"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.65,
            clipPath: `circle(220px at ${mousePos.x}px ${mousePos.y}px)`,
          }}
        >
          <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(26,13,6,0.9)]" />
        </div>
      )}

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center mt-20 pointer-events-none">
        <p data-reveal className="text-gold-400 text-xs font-bold uppercase tracking-[0.3em] mb-6">
          A Modern Culinary Experience
        </p>
        <h1 data-reveal className="font-serif text-5xl md:text-7xl font-bold text-cream-50 leading-tight mb-8 drop-shadow-2xl">
          Crafted with Passion. <br />
          <span className="text-gold-400 italic font-light">Served with Elegance.</span>
        </h1>

        <div data-reveal className="flex items-center justify-center mb-12 pointer-events-auto">
          <MagneticButton
            href="#menu"
            className="bg-gold-500 text-brown-950 font-bold uppercase tracking-wider text-sm px-10 py-5 rounded-none hover:bg-gold-400"
          >
            Explore Menu
          </MagneticButton>
        </div>

        <div
          data-reveal
          className="grid grid-cols-2 md:grid-cols-6 gap-8 border-t border-white/10 pt-12 mt-4 items-center bg-brown-950/20 backdrop-blur-sm p-6 rounded-none border border-white/5"
        >
          <div className="col-span-2 md:col-span-3 flex justify-center md:justify-start gap-8 md:gap-12">
            <div className="flex flex-col items-center gap-3">
              <Smartphone className="w-6 h-6 text-cream-400 animate-story-1" />
              <span className="text-cream-50/70 text-[10px] uppercase tracking-widest font-bold">Order</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <UtensilsCrossed className="w-6 h-6 text-cream-400 animate-story-2" />
              <span className="text-cream-50/70 text-[10px] uppercase tracking-widest font-bold">Eat</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Heart className="w-6 h-6 text-cream-400 animate-story-3" />
              <span className="text-cream-50/70 text-[10px] uppercase tracking-widest font-bold">Enjoy</span>
            </div>
          </div>

          <div className="col-span-2 md:col-span-3 flex justify-center md:justify-end gap-8 md:gap-12 md:border-l border-white/10 md:pl-12">
            {heroStats.map(({ icon: Icon, num, label }) => (
              <div key={label} className="text-center">
                <Icon className="w-5 h-5 text-gold-400 mx-auto mb-2 opacity-50" />
                <p className="font-serif text-xl md:text-2xl font-bold text-cream-50">{num}</p>
                <p className="text-white/40 text-[9px] mt-1 uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
