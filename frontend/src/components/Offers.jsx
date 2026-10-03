import { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import { useCart } from '@/components/context/CartContext';
import { playClickSound, flyToCart, triggerHaptic } from '@/components/utils/interactions';
import useReveal from '@/components/hooks/useReveal';
import { API_BASE } from '@/components/config/api';

export default function Offers() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [animatingBtn, setAnimatingBtn] = useState(null);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const response = await fetch(`${API_BASE}/menu/`);
        if (response.ok) {
          const rawData = await response.json();
          const menuArray = Array.isArray(rawData) ? rawData : rawData.results || [];
          setCombos(menuArray.filter((item) => item.category === "Combos & Offers" && item.is_available));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCombos();
  }, []);

  useReveal([loading, combos]);

  const handleAddToCart = (e, combo) => {
    playClickSound();
    triggerHaptic();
    flyToCart(e);
    addToCart(combo);
    setAnimatingBtn(combo.id);
    setTimeout(() => setAnimatingBtn(null), 1000);
  };

  if (!loading && combos.length === 0) return null;

  return (
    <section id="combos" className="py-32 bg-cream-50 relative overflow-hidden">
      <div className="aurora-orb aurora-orb-1 top-0 left-0 -translate-x-1/2 -translate-y-1/2" />
      <div className="aurora-orb aurora-orb-2 bottom-0 right-0 translate-x-1/3 translate-y-1/3" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20" data-reveal>
          <p className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em] mb-4 flex items-center justify-center gap-2">
            <Tag className="w-3.5 h-3.5" /> Exclusive Packages
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-brown-900 mb-6">Curated Combos</h2>
          <div className="w-12 h-[2px] bg-gold-400 mx-auto" />
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-12">
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton-card w-full h-[500px] rounded-none" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-12">
            {combos.map((combo, i) => {
              const originalPrice = Math.round(parseFloat(combo.price) * 1.25);
              const isAnimating = animatingBtn === combo.id;
              return (
                <div
                  key={combo.id}
                  data-reveal
                  style={{ transitionDelay: `${i * 120}ms` }}
                  className="group flex flex-col"
                >
                  <div className="relative h-80 overflow-hidden mb-6">
                    <img
                      src={combo.img}
                      alt={combo.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-brown-950 text-gold-400 text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest">
                      Special Value
                    </div>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-brown-900 mb-3">{combo.name}</h3>
                  <p className="text-brown-500 text-sm leading-relaxed mb-6 flex-grow">
                    A curated combination designed to deliver exceptional flavor and value.
                  </p>

                  <div className="flex items-center justify-between border-t border-cream-200 pt-6">
                    <div className="flex items-baseline gap-3">
                      <span className="font-serif text-2xl font-bold text-gold-700">₹{combo.price}</span>
                      <span className="text-brown-400/50 line-through text-sm">₹{originalPrice}</span>
                      <span className="bg-green-700/10 text-green-700 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm">
                        Save 20%
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(e, combo)}
                      className={`text-xs uppercase tracking-widest font-bold pb-1 transition-colors border-b active-scale ${
                        isAnimating
                          ? 'text-green-700 border-green-700'
                          : 'text-brown-900 border-gold-400 hover:text-gold-600'
                      }`}
                    >
                      {isAnimating ? 'Added' : 'Add to Order'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
