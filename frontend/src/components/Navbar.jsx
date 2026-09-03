import { ShoppingCart, Menu as MenuIcon, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart, setIsCartOpen } = useCart();

  const cartItemsCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    // FIXED: Ensured Navbar stays at z-50 so the CartDrawer (z-[101]) easily covers it
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-brown-950/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="#" className="font-serif text-2xl font-bold text-gold-400 tracking-wider">
          HIGH SPIRITS
        </a>
        
        <div className="hidden md:flex items-center gap-8 text-cream-100 font-medium">
          <a href="#about" className="hover:text-gold-400 transition-colors">About</a>
          <a href="#menu" className="hover:text-gold-400 transition-colors">Menu</a>
          <a href="#delivery" className="hover:text-gold-400 transition-colors">Delivery</a>
          <a href="#booking" className="hover:text-gold-400 transition-colors">Book Table</a>
          <a href="#reviews" className="hover:text-gold-400 transition-colors">Reviews</a>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-cream-100 hover:text-gold-400 transition-colors ml-4"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold-500 text-brown-950 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-brown-950">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-4">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-cream-100"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold-500 text-brown-950 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-brown-950">
                {cartItemsCount}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-cream-100"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-brown-950 border-t border-brown-800 shadow-xl py-4 flex flex-col items-center gap-4">
          <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="text-cream-100 hover:text-gold-400">About</a>
          <a href="#menu" onClick={() => setIsMobileMenuOpen(false)} className="text-cream-100 hover:text-gold-400">Menu</a>
          <a href="#delivery" onClick={() => setIsMobileMenuOpen(false)} className="text-cream-100 hover:text-gold-400">Delivery</a>
          <a href="#booking" onClick={() => setIsMobileMenuOpen(false)} className="text-cream-100 hover:text-gold-400">Book Table</a>
          <a href="#reviews" onClick={() => setIsMobileMenuOpen(false)} className="text-cream-100 hover:text-gold-400">Reviews</a>
        </div>
      )}
    </nav>
  );
}