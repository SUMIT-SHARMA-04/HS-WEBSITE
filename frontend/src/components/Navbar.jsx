import { useState, useEffect } from 'react';
import { Menu as MenuIcon, X, UtensilsCrossed, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Menu', href: '#menu' },
  { label: 'Book', href: '#book' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-brown-900/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2 group">
          <UtensilsCrossed className="w-7 h-7 text-gold-400 group-hover:text-gold-300 transition-colors" />
          <span className="font-serif text-xl font-bold text-cream-100 tracking-wide">High Spirits Cafe</span>
        </a>

        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="text-cream-200 hover:text-gold-300 text-sm font-medium tracking-wide uppercase transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-gold-400 after:transition-all hover:after:w-full">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-5 md:gap-6">
          <button className="relative text-cream-200 hover:text-gold-300 transition-colors flex items-center" aria-label="View Cart" onClick={() => setIsCartOpen(true)}>
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <a href="#book" className="hidden md:block btn-gold text-sm font-medium px-5 py-2.5 rounded-full">Book a Table</a>
          <button className="md:hidden text-cream-200 hover:text-cream-100 transition-colors" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-brown-900/98 backdrop-blur-sm border-t border-brown-700">
          <ul className="px-6 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setIsOpen(false)} className="text-cream-200 hover:text-cream-100 text-base font-medium block py-1 transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#book" onClick={() => setIsOpen(false)} className="inline-block btn-gold text-sm font-medium px-5 py-2.5 rounded-full mt-2">Book a Table</a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}