import { useState, useEffect } from 'react';
import { useCart } from "@/context/CartContext";
import { Loader } from 'lucide-react';

export default function Menu() {
  const [menuData, setMenuData] = useState({});
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [animatingBtn, setAnimatingBtn] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('http://localhost:8000/menu/');
        if (response.ok) {
          const data = await response.json();
          
          // Group the flat array into categories dynamically
          const groupedData = data.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
          }, {});

          setMenuData(groupedData);
          
          const categories = Object.keys(groupedData);
          if (categories.length > 0) {
            setActiveCategory(categories[0]);
          }
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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('animate-in-view');
        });
      },
      { threshold: 0.15 }
    );
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
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12" data-reveal>
          <p className="text-gold-600 text-sm font-medium uppercase tracking-[0.25em] mb-3">
            Culinary Journey
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-brown-900 mb-4">
            Our Menu
          </h2>
          <div className="w-16 gold-divider mx-auto mb-6" />
          <p className="text-brown-600 max-w-xl mx-auto leading-relaxed">
            Explore our diverse range of purely vegetarian delights.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-brown-500">
             <Loader className="w-10 h-10 animate-spin mb-4" />
             <p>Loading the latest menu...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 text-brown-500">
             <p>Menu is currently being updated. If you are the admin, please add items in the dashboard.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center gap-2 mb-12 flex-wrap" data-reveal>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === cat ? 'bg-brown-900 text-gold-400 shadow-md' : 'bg-transparent text-brown-600 border border-brown-300 hover:border-brown-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  data-reveal
                  style={{ transitionDelay: `${Math.min(i * 50, 1000)}ms` }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                >
                  <div className="relative overflow-hidden h-52">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-lg font-semibold text-brown-900 flex items-center">
                        <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-green-600 rounded-sm mr-2 shrink-0">
                          <span className="w-2 h-2 bg-green-600 rounded-full" />
                        </span>
                        {item.name}
                      </h3>
                      <span className="font-serif text-lg font-bold text-gold-700 ml-3 shrink-0">
                        ₹{item.price}
                      </span>
                    </div>
                    
                    <div className="mt-auto pt-6">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`w-full py-2.5 rounded-xl font-medium transition-all duration-300 ${
                          animatingBtn === item.id
                            ? 'bg-green-600 text-white scale-95'
                            : 'bg-brown-900 text-cream-100 hover:bg-brown-800'
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

        <div className="text-center mt-16" data-reveal>
          <a
            href="#book"
            className="inline-block px-8 py-3.5 rounded-full border border-gold-600 text-gold-700 hover:bg-gold-600 hover:text-white transition-colors font-medium"
          >
            Reserve to Experience It
          </a>
        </div>
      </div>
    </section>
  );
}