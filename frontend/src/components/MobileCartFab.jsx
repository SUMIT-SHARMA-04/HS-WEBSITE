import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/context/CartContext';
import { useState, useEffect } from 'react';

export default function MobileCartFab() {
  const { cart, setIsCartOpen } = useCart();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const cartItemCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  if (cartItemCount === 0) return null;

  return (
    <div className={`md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
      <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-3 bg-brown-900 text-gold-400 px-6 py-4 rounded-full shadow-[0_10px_30px_rgba(38,19,9,0.3)] active-scale border border-gold-400/20">
        <ShoppingBag className="w-5 h-5" />
        <span className="font-bold uppercase tracking-widest text-xs">View Order ({cartItemCount})</span>
      </button>
    </div>
  );
}