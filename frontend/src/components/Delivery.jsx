import { Bike, ExternalLink } from 'lucide-react';
import useReveal from '@/components/hooks/useReveal';

export default function Delivery() {
  useReveal();

  return (
    <section id="delivery" className="relative py-32 bg-brown-950 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-fixed opacity-30"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=1920)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brown-950 via-brown-950/80 to-brown-950" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div data-reveal>
          <p className="text-gold-400 text-xs font-bold uppercase tracking-[0.3em] mb-4 flex items-center justify-center gap-2">
            <Bike className="w-4 h-4" /> On-Demand
          </p>
          <h2 className="font-serif text-4xl md:text-6xl font-bold text-cream-50 mb-6 leading-tight">Bring the High Spirits Experience Home</h2>
          <div className="w-12 h-[2px] bg-gold-400 mx-auto mb-8" />

          <p className="text-white/60 text-sm max-w-xl mx-auto mb-16 leading-relaxed font-light">
            Craving our signature flavors but want to stay in? We've partnered with your favorite delivery platforms to bring our kitchen straight to your doorstep.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="http://zoma.to/r/21897308" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto bg-[#E23744] text-white px-10 py-5 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-transform hover:-translate-y-1 active-scale">
              Order on Zomato
              <ExternalLink className="w-4 h-4 opacity-50" />
            </a>
            <a href="https://www.swiggy.com/city/jaipur/h-s-bhojnalaya-and-cafe-vidhyadhar-nagar-rest1081614" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto bg-[#FC8019] text-white px-10 py-5 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-transform hover:-translate-y-1 active-scale">
              Order on Swiggy
              <ExternalLink className="w-4 h-4 opacity-50" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
