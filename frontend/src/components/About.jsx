import { useState, useEffect } from 'react';
import { Leaf, Award } from 'lucide-react';
import useReveal from '@/components/hooks/useReveal';

const tabs = [
  {
    key: 'veg',
    icon: Leaf,
    title: 'Pure Veg',
    desc1: 'High Spirits Cafe opened in Jaipur in 2022 with a clear mandate: to prove that pure vegetarian cuisine can compete at the highest levels of culinary craftsmanship. We moved beyond standard cafe fare to build a menu rooted in bold flavors and honest cooking.',
    desc2: 'We do not rely on artificial additives, pre-packaged sauces, or shortcuts. Our kitchen operates strictly meat-free, sourcing seasonal produce from trusted local farms across Rajasthan.',
    points: ['No artificial additives or shortcuts', 'Fresh farm-sourced local produce', 'Entirely meat-free kitchen'],
  },
  {
    key: 'premium',
    icon: Award,
    title: 'Premium Quality',
    desc1: 'From sourcing to plating, we hold every detail to an exacting standard. Our chefs combine traditional flavors with modern artistry, ensuring every plate is finished with absolute precision.',
    desc2: 'Whether it is a quick afternoon coffee or a multi-course evening dinner, every dish reflects our commitment to clean, wholesome ingredients. Our guests deserve nothing less than excellence, every single visit.',
    points: ['Hand-selected premium ingredients', 'Classical culinary techniques', 'Meticulous presentation'],
  },
];

export default function About() {
  const [active, setActive] = useState('veg');
  const current = tabs.find((t) => t.key === active);
  const [autoplayVideo, setAutoplayVideo] = useState(true);

  useReveal();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAutoplayVideo(false);
    }
  }, []);

  return (
    <section id="about" className="py-24 md:py-32 bg-cream-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

          <div className="relative h-[400px] lg:h-[650px] w-full order-2 lg:order-1 flex gap-3 md:gap-4" data-reveal>
            <div className="relative h-full" style={{ flex: '1.6' }}>
              <div className="absolute inset-0 border border-gold-400/30 translate-x-3 translate-y-3 md:translate-x-4 md:translate-y-4" />
              <video
                autoPlay={autoplayVideo}
                loop={autoplayVideo}
                muted
                playsInline
                poster="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800"
                className="relative z-10 w-full h-full object-cover shadow-2xl bg-brown-950"
              >
                <source src="https://videos.pexels.com/video-files/8522928/8522928-uhd_2160_3840_25fps.mp4" type="video/mp4" />
              </video>
            </div>

            <div className="relative flex-1 h-full rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://images.pexels.com/photos/6223226/pexels-photo-6223226.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Fresh vegetarian pizza"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          <div data-reveal className="max-w-lg order-1 lg:order-2 w-full">
            <p className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em] mb-4">Our Philosophy</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-brown-900 mb-8 leading-tight">
              A New Standard for Vegetarian Dining.
            </h2>

            <div className="w-12 h-[2px] bg-gold-400 mb-8" />

            <div className="flex gap-8 mb-8 border-b border-cream-200">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActive(tab.key)}
                  className={`relative pb-4 text-[10px] uppercase tracking-widest font-bold transition-colors active-scale ${
                    active === tab.key ? 'text-brown-900' : 'text-brown-400 hover:text-brown-600'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <tab.icon className="w-4 h-4" /> {tab.title}
                  </span>
                  {active === tab.key && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gold-400" />}
                </button>
              ))}
            </div>

            <div key={active} className="animate-fade-in">
              <div className="text-brown-600/90 text-sm leading-loose mb-8 min-h-[160px]">
                <p className="mb-4">{current?.desc1}</p>
                <p>{current?.desc2}</p>
              </div>

              <ul className="space-y-4 text-sm text-brown-500 font-medium pt-4 border-t border-cream-200/50">
                {current?.points.map((point) => (
                  <li key={point} className="flex items-center gap-4">
                    <span className="w-1.5 h-1.5 bg-gold-400 rounded-full shrink-0" /> {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-cream-200 pt-8">
              <div>
                <p className="font-serif text-2xl font-bold text-brown-900 mb-1">100%</p>
                <p className="text-[10px] uppercase tracking-widest text-brown-500 font-bold">Pure Veg</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-brown-900 mb-1">2022</p>
                <p className="text-[10px] uppercase tracking-widest text-brown-500 font-bold">Established</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-brown-900 mb-1">Jaipur</p>
                <p className="text-[10px] uppercase tracking-widest text-brown-500 font-bold">Based</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}