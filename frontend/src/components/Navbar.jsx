import { useState, useEffect } from 'react';
import { Menu as MenuIcon, X, ShoppingBag, Bike } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart, setIsCartOpen } = useCart();

  const urlParams = new URLSearchParams(window.location.search);
  const isHotelGuest = urlParams.has('room');

  const cartItemCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // UPDATED: Added Combos and Events to the navigation array
  const navLinks = [
    { name: 'Menu', href: '#menu' },
    { name: 'Combos', href: '#combos' },
    { name: 'Events', href: '#events' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className={`fixed w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-brown-950/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        <a href="#" className="font-serif text-2xl md:text-3xl font-bold text-gold-400 tracking-wider">
          High Spirits
        </a>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-cream-100 hover:text-gold-400 text-sm uppercase tracking-widest font-medium transition-colors">
              {link.name}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {!isHotelGuest && (
            <a href="#delivery" className="flex items-center gap-2 text-white bg-[#E23744] hover:bg-red-700 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-colors shadow-md">
              <Bike className="w-4 h-4" /> Order Online
            </a>
          )}

          <a href="#book" className="btn-gold px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-colors shadow-md">
            Book Table
          </a>
          
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-cream-100 hover:text-gold-400 transition-colors">
            <ShoppingBag className="w-6 h-6" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold-500 text-brown-950 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-brown-950">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-4">
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-cream-100 hover:text-gold-400 transition-colors">
            <ShoppingBag className="w-6 h-6" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold-500 text-brown-950 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-brown-950">
                {cartItemCount}
              </span>
            )}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-cream-100">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-brown-950 shadow-xl border-t border-brown-800 animate-slide-up">
          <div className="flex flex-col p-6 gap-4">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="text-cream-100 text-lg uppercase tracking-widest font-medium border-b border-brown-800 pb-4"
              >
                {link.name}
              </a>
            ))}
            
            {!isHotelGuest && (
              <a 
                href="#delivery" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="flex items-center justify-center gap-2 text-white bg-[#E23744] py-3 rounded-full font-bold uppercase tracking-wider mt-2 shadow-md"
              >
                <Bike className="w-5 h-5" /> Order Online
              </a>
            )}
            
            <a 
              href="#book" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="text-center btn-gold py-3 rounded-full font-bold uppercase tracking-wider mt-2 shadow-md"
            >
              Book Table
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}