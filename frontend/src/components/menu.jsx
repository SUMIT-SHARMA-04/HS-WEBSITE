import { useState, useEffect } from 'react';
import { useCart } from "@/context/CartContext";
import { Loader, Sparkles } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Menu() {
  const [menuData, setMenuData] = useState({});
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [animatingBtn, setAnimatingBtn] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`${API_BASE}/menu/`);
        if (response.ok) {
          const rawData = await response.json();
          
          // CRASH-PROOF: Extract the array whether Django paginated it or not
          const menuArray = Array.isArray(rawData) ? rawData : rawData.results || [];
          
          const groupedData = menuArray.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
          }, {});

          const sortedData = {};
          if (groupedData["Combos & Offers"]) {
            sortedData["Combos & Offers"] = groupedData["Combos & Offers"];
            delete groupedData["Combos & Offers"];
          }
          Object.assign(sortedData, groupedData);

          setMenuData(sortedData);
          const categories = Object.keys(sortedData);
          if (categories.length > 0) setActiveCategory(categories[0]);
        }
      } catch (error) {
        console.error("Failed to load menu", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);
  
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('animate-in-view');
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeCategory, loading]);

  const handleAddToCart = (item) => {
    addToCart(item);
    setAnimatingBtn(item.id);
    setTimeout(() => setAnimatingBtn(null), 1000);
  };

  const categories = Object.keys(menuData);
  const items = menuData[activeCategory] || [];

  return (
    <section id="menu" className="py-24 bg-cream-200/40">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10" data-reveal>
          <p className="text-gold-600 text-sm font-medium uppercase tracking-[0.25em] mb-3">Culinary Journey</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-brown-900 mb-4">Our Menu</h2>
          <div className="w-16 gold-divider mx-auto mb-6" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-brown-500">
             <Loader className="w-10 h-10 animate-spin mb-4" />
             <p>Loading the latest menu...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 text-brown-500">
             <p>Menu is currently being updated.</p>
          </div>
        ) : (
          <>
            <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 pb-4 md:justify-center md:flex-wrap" data-reveal>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeCategory === cat ? 'bg-brown-900 text-gold-400 shadow-md' : 'bg-white text-brown-600 border border-cream-300 hover:border-brown-900'
                  }`}
                >
                  {cat === "Combos & Offers" && <Sparkles className="w-4 h-4" />}
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  data-reveal
                  style={{ transitionDelay: `${Math.min((i % 4) * 50, 500)}ms` }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-cream-100 group"
                >
                  <div className="relative w-full h-28 md:h-52 shrink-0 overflow-hidden">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    {item.category === "Combos & Offers" && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-1 rounded-md uppercase shadow-sm">Offer</span>
                    )}
                  </div>
                  
                  <div className="p-3 md:p-6 flex flex-col flex-grow justify-between">
                    <div>
                      <h3 className="font-serif text-sm md:text-lg font-semibold text-brown-900 leading-tight mb-1 flex items-start">
                        <span className="inline-flex items-center justify-center w-3 h-3 md:w-3.5 md:h-3.5 border border-green-600 rounded-sm mr-1.5 mt-0.5 shrink-0">
                          <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-600 rounded-full" />
                        </span>
                        <span className="line-clamp-2">{item.name}</span>
                      </h3>
                      <p className="font-serif text-sm md:text-lg font-bold text-gold-700 mt-1 md:mt-2">₹{item.price}</p>
                    </div>
                    
                    <div className="mt-3 md:mt-6">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`w-full py-1.5 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all duration-300 ${
                          animatingBtn === item.id ? 'bg-green-600 text-white scale-95' : 'bg-brown-900 text-cream-100 hover:bg-brown-800'
                        }`}
                      >
                        {animatingBtn === item.id ? 'Added!' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}