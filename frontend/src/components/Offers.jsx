import { useState, useEffect } from 'react';
import { Tag, Sparkles, Loader, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
          
          // Filters backend data specifically for active Combos
          const activeCombos = menuArray.filter(item => item.category === "Combos & Offers" && item.is_available);
          setCombos(activeCombos);
        }
      } catch (error) {
        console.error("Failed to load combos", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCombos();
  }, []);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in-view');
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll('[data-reveal]');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading, combos]);

  const handleAddToCart = (combo) => {
    addToCart(combo);
    setAnimatingBtn(combo.id);
    setTimeout(() => setAnimatingBtn(null), 1000);
  };

  // Completely hides the section if you have no active combos in the database
  if (!loading && combos.length === 0) return null;

  return (
    <section id="combos" className="py-24 bg-gradient-to-b from-cream-100 to-cream-200/60 relative overflow-hidden">
      <div className="absolute top-20 right-10 w-72 h-72 bg-brown-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-60 h-60 bg-cream-400/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-14" data-reveal>
          <div className="inline-flex items-center gap-2 bg-gold-100 text-gold-700 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider mb-4">
            <Tag className="w-3.5 h-3.5" />
            Exclusive Combos
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-brown-900 mb-4">
            Delicious Combos
          </h2>
          <div className="w-16 gold-divider mx-auto mb-6" />
          <p className="text-brown-600 max-w-xl mx-auto leading-relaxed">
            Thoughtfully curated experiences and dining packages — because an
            exceptional meal should be within reach any day of the week.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-brown-400" /></div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {combos.map((combo, i) => {
              // Calculates a display "original price" (+25%) to visually show savings
              const originalPrice = Math.round(parseFloat(combo.price) * 1.25);
              const isAnimating = animatingBtn === combo.id;

              return (
                <div
                  key={combo.id}
                  data-reveal
                  style={{ transitionDelay: `${i * 120}ms` }}
                  className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col"
                >
                  <div className="relative h-56 overflow-hidden shrink-0">
                    <img
                      src={combo.img}
                      alt={combo.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brown-900/60 to-transparent" />
                    <span className="absolute top-4 left-4 bg-gradient-to-r from-gold-400 to-gold-600 text-brown-950 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-md">
                      Special Offer
                    </span>
                    <div className="absolute bottom-4 left-4 w-10 h-10 bg-white/95 rounded-full flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-gold-700" />
                    </div>
                  </div>

                  <div className="p-7 flex flex-col flex-grow">
                    <h3 className="font-serif text-xl font-semibold text-brown-900 mb-2">
                      {combo.name}
                    </h3>
                    <p className="text-brown-500 text-sm leading-relaxed mb-5 flex-grow">
                      A specially curated combination designed to give you the best flavors at a great value.
                    </p>

                    <div className="flex items-end justify-between mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-3xl font-bold text-gold-700">
                          ₹{combo.price}
                        </span>
                        <span className="text-brown-400 line-through text-sm">
                          ₹{originalPrice}
                        </span>
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-1">
                          Save 20%
                        </span>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-cream-200">
                      <button
                        onClick={() => handleAddToCart(combo)}
                        className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                          isAnimating ? 'bg-green-600 text-white scale-95' : 'btn-gold shadow-md hover:shadow-lg'
                        }`}
                      >
                        {isAnimating ? 'Added to Cart!' : <><ShoppingBag className="w-4 h-4" /> Add Combo to Cart</>}
                      </button>
                    </div>
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