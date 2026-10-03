import { useState, useEffect } from 'react';
import { useCart } from "@/context/CartContext";
import { playClickSound, flyToCart, triggerHaptic } from '@/utils/interactions';
import { API_BASE } from '@/config/api';

export default function Menu() {
  const [menuData, setMenuData] = useState({});
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [animatingBtn, setAnimatingBtn] = useState(null);
  const { addToCart } = useCart();

  const fetchMenu = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await fetch(`${API_BASE}/menu/`);
      if (!response.ok) throw new Error(`Menu request failed (${response.status})`);
      const rawData = await response.json();
      const menuArray = Array.isArray(rawData) ? rawData : rawData.results || [];
      const groupedData = menuArray.reduce((acc, item) => {
        if (item.category === "Combos & Offers") return acc;
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      }, {});
      setMenuData(groupedData);
      const categories = Object.keys(groupedData);
      if (categories.length > 0) setActiveCategory(categories[0]);
    } catch (error) {
      console.error(error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMenu(); }, []);

  const handleAddToCart = (e, item) => {
    playClickSound();
    triggerHaptic();
    flyToCart(e);
    addToCart(item);
    setAnimatingBtn(item.id);
    setTimeout(() => setAnimatingBtn(null), 1000);
  };

  const categories = Object.keys(menuData);
  const items = menuData[activeCategory] || [];

  return (
    <section id="menu" className="py-32 bg-cream-100 relative overflow-hidden">
      <div className="bg-grain" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em] mb-4">Culinary Journey</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-brown-900 mb-6">Our Menu</h2>
          <div className="w-12 h-[2px] bg-gold-400 mx-auto" />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-none shadow-sm h-80 border border-cream-200 flex flex-col">
                <div className="skeleton-card w-full h-40 rounded-none" />
                <div className="p-5 flex flex-col gap-3 flex-grow">
                  <div className="skeleton-card w-3/4 h-5" />
                  <div className="skeleton-card w-full h-12 mt-auto rounded-none" />
                </div>
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="text-center py-20">
            <p className="text-brown-500 text-sm tracking-widest uppercase mb-6">Couldn't load the menu. Check your connection and try again.</p>
            <button onClick={fetchMenu} className="text-xs uppercase tracking-widest font-bold text-gold-600 border-b border-gold-400 pb-1 hover:text-brown-900 transition-colors active-scale">Retry</button>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 text-brown-500 text-sm tracking-widest uppercase">
            Menu is currently being updated.
          </div>
        ) : (
          <>
            <div className="sticky top-[72px] z-30 bg-cream-100/90 backdrop-blur-xl py-4 border-b border-cream-200 mb-8 -mx-4 px-4 md:mx-0 md:px-0">
              <div className="flex overflow-x-auto hide-scrollbar gap-3 w-full pb-2 md:pb-0 snap-x snap-mandatory">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { playClickSound(); setActiveCategory(cat); }}
                    className={`snap-center whitespace-nowrap px-6 py-2.5 rounded-full text-xs uppercase tracking-[0.1em] font-bold transition-all duration-300 active-scale ${
                      activeCategory === cat
                        ? 'bg-brown-900 text-gold-400 shadow-lg'
                        : 'bg-transparent text-brown-600 border border-brown-900/20 hover:border-gold-400 hover:text-brown-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div key={activeCategory} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {items.length === 0 ? (
                 <div className="col-span-full py-16 text-center text-brown-500 font-medium">No items found in this category.</div>
              ) : (
                items.map((item, i) => (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${Math.min(i, 8) * 80}ms` }}
                    className={`animate-deal-card bg-white rounded-none overflow-hidden shadow-[0_4px_20px_rgba(38,19,9,0.02)] hover:shadow-[0_15px_40px_rgba(38,19,9,0.08)] transition-all duration-500 flex flex-col border border-cream-200 group ${
                      !item.is_available ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="relative w-full h-40 md:h-56 shrink-0 overflow-hidden">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                        decoding="async"
                      />
                      {!item.is_available && (
                        <div className="absolute inset-0 bg-brown-950/40 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-brown-900 text-cream-100 font-bold px-4 py-1.5 text-[10px] uppercase tracking-widest">Sold Out</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 md:p-6 flex flex-col flex-grow justify-between bg-white">
                      <div>
                        <h3 className="font-serif text-sm md:text-lg font-bold text-brown-900 leading-tight mb-2 flex items-start gap-2">
                          <span className="mt-1 inline-flex items-center justify-center w-3 h-3 md:w-3.5 md:h-3.5 border-[1.5px] border-green-700 rounded-sm shrink-0">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-700 rounded-full" />
                          </span>
                          <span className="line-clamp-2">{item.name}</span>
                        </h3>
                        <p className="font-serif text-base md:text-xl font-bold text-gold-600 mt-2">
                          ₹{item.price}
                        </p>
                      </div>

                      <div className="mt-6 md:mt-8">
                        <button
                          onClick={(e) => item.is_available && handleAddToCart(e, item)}
                          disabled={!item.is_available}
                          className={`w-full py-3 md:py-4 text-xs font-bold uppercase tracking-[0.1em] transition-colors duration-300 active-scale ${
                            !item.is_available
                              ? 'bg-cream-100 text-brown-400 cursor-not-allowed'
                              : animatingBtn === item.id
                              ? 'bg-green-700 text-white shadow-lg shadow-green-700/30'
                              : 'bg-brown-950 text-gold-400 hover:bg-gold-500 hover:text-brown-950'
                          }`}
                        >
                          {!item.is_available
                            ? 'Unavailable'
                            : animatingBtn === item.id
                            ? 'Added to Order'
                            : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
