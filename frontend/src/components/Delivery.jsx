import { Bike, ExternalLink, MapPin } from 'lucide-react';

export default function Delivery() {
  return (
    <section id="delivery" className="relative py-24 bg-brown-950 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=1920" alt="Restaurant food spread" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-brown-950 via-brown-950/80 to-brown-950" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <p className="text-gold-400 text-sm font-medium uppercase tracking-[0.25em] mb-3 flex items-center justify-center gap-2">
          <Bike className="w-4 h-4" /> On-Demand Delivery
        </p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-cream-100 mb-6 leading-tight">Bring the High Spirits Experience Home</h2>
        <div className="w-16 gold-divider mx-auto mb-8" />
        
        <p className="text-cream-300/90 text-sm md:text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
          Craving our signature flavors but want to stay in? We've partnered with your favorite delivery platforms to bring our kitchen straight to your doorstep. Hot, fresh, and perfectly packaged.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <a href="https://www.zomato.com/" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto group relative overflow-hidden bg-[#E23744] text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
            <span className="relative z-10 font-bold text-lg tracking-wide">Order on Zomato</span>
            <ExternalLink className="relative z-10 w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
          </a>
          <a href="https://www.swiggy.com/" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto group relative overflow-hidden bg-[#FC8019] text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
            <span className="relative z-10 font-bold text-lg tracking-wide">Order on Swiggy</span>
            <ExternalLink className="relative z-10 w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>
    </section>
  );
}