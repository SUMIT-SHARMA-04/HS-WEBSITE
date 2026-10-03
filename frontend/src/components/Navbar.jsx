import { useState, useEffect } from 'react';
import { Menu as MenuIcon, X, ShoppingBag, Bike, Bed } from 'lucide-react';
import { useCart } from '@/components/context/CartContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart, setIsCartOpen, hotelRoom, clearRoom } = useCart();

  const isHotelGuest = !!hotelRoom;
  const cartItemCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  const handleExitRoom = () => {
    if (window.confirm(`Exit room service for Room ${hotelRoom}? You'll browse as a walk-in guest.`)) {
      clearRoom();
      setIsMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleEscape = (e) => { if (e.key === 'Escape') setIsMobileMenuOpen(false); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'Menu', href: '#menu' }, 
    { name: 'Combos', href: '#combos' }, 
    { name: 'About', href: '#about' },
    { name: 'Reviews', href: '#reviews' }, 
    { name: 'Contact', href: '#contact' }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'glass-panel py-3 shadow-2xl' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="#" className="font-serif text-2xl font-bold text-cream-50 tracking-widest hover:text-gold-400 transition-colors">
            HIGH SPIRITS
          </a>
          {isHotelGuest && (
            <button
              onClick={handleExitRoom}
              title="Exit room service mode"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-gold-400/10 border border-gold-400/40 text-gold-300 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-gold-400/20 transition-colors active-scale"
            >
              <Bed className="w-3 h-3 text-gold-400" /> Room {hotelRoom} <X className="w-3 h-3 ml-1 opacity-60" />
            </button>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-cream-100 hover:text-gold-400 text-xs uppercase tracking-[0.2em] font-bold transition-colors">
              {link.name}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-6">
          {!isHotelGuest ? (
            <a href="#delivery" className="flex items-center gap-2 text-cream-50 hover:text-gold-400 text-xs font-bold uppercase tracking-widest transition-colors">
              <Bike className="w-4 h-4" /> Order Online
            </a>
          ) : (
            <span className="text-gold-400 text-xs font-bold uppercase tracking-widest">
              Room Service Active
            </span>
          )}
          <a href="#book" className="border border-gold-400/50 text-gold-300 hover:bg-gold-400 hover:text-brown-950 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all">
            Book Table
          </a>
          <button onClick={() => setIsCartOpen(true)} aria-label="Open cart" className="relative text-cream-100 hover:text-gold-400 transition-colors group">
            <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold-500 text-brown-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-5">
          <button onClick={() => setIsCartOpen(true)} aria-label="Open cart" className="relative text-cream-100 hover:text-gold-400">
            <ShoppingBag className="w-6 h-6" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold-500 text-brown-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={isMobileMenuOpen} className="text-cream-100 relative z-[60]">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className={`md:hidden fixed inset-0 bg-brown-950/95 backdrop-blur-xl z-40 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col justify-center px-8 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="flex flex-col gap-8">
          {isHotelGuest && (
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-gold-400 font-bold uppercase tracking-widest text-xs">
                <Bed className="w-4 h-4" /> Guest Suite {hotelRoom}
              </div>
              <button onClick={handleExitRoom} className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest active-scale">
                Exit
              </button>
            </div>
          )}
          {navLinks.map((link, i) => (
            <a 
              key={link.name} 
              href={link.href} 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="text-cream-50 font-serif text-4xl border-b border-white/10 pb-4 transition-all duration-500 hover:text-gold-400 active-scale" 
              style={{ transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(40px)', opacity: isMobileMenuOpen ? 1 : 0, transitionDelay: `${i * 100}ms` }}
            >
              {link.name}
            </a>
          ))}
          {!isHotelGuest && (
            <a 
              href="#delivery" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="flex items-center gap-3 text-gold-400 font-bold uppercase tracking-[0.2em] text-sm mt-8 active-scale" 
              style={{ transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(40px)', opacity: isMobileMenuOpen ? 1 : 0, transitionDelay: `${navLinks.length * 100}ms` }}
            >
              <Bike className="w-5 h-5" /> Order for Delivery
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}