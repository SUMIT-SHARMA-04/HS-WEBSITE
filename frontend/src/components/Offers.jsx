import { useState, useEffect } from 'react';
import { Tag, Sparkles, Gift, Users, ArrowRight } from 'lucide-react';

// UPDATED: Changed currency to ₹ and updated values
const combos = [
  {
    icon: Sparkles,
    badge: 'Weekday Special',
    title: 'Two-Course Lunch',
    desc: 'A starter and main from our seasonal lunch menu, served Tuesday through Thursday.',
    price: '₹499',
    originalPrice: '₹699',
    note: 'Available 12pm – 2:30pm',
    image: 'https://images.pexels.com/photos/35160887/pexels-photo-35160887.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    accent: 'from-cream-200 to-cream-100',
  },
  {
    icon: Users,
    badge: 'Group Dining',
    title: 'Family Feast',
    desc: 'A sharing-style menu for groups of six or more — five courses designed for the whole table.',
    price: '₹1499',
    originalPrice: '₹1999',
    note: 'Min. 6 guests · advance booking',
    image: 'https://images.pexels.com/photos/6954474/pexels-photo-6954474.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    accent: 'from-brown-100 to-cream-100',
  },
  {
    icon: Gift,
    badge: 'Limited Time',
    title: 'Sunday Brunch',
    desc: 'Bottomless beverages, a live carving station, and our full pastry counter — every Sunday.',
    price: '₹899',
    originalPrice: '₹1199',
    note: '11am – 3pm · walk-ins welcome',
    image: 'https://images.pexels.com/photos/29086310/pexels-photo-29086310.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    accent: 'from-cream-200 to-brown-100',
  },
];

export default function Offers() {
  useEffect(() => {
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
  }, []);

  return (
    // UPDATED: ID changed to combos to match the new Navbar link
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

        <div className="grid md:grid-cols-3 gap-8">
          {combos.map((combo, i) => {
            const Icon = combo.icon;
            return (
              <div
                key={combo.title}
                data-reveal
                style={{ transitionDelay: `${i * 120}ms` }}
                className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={combo.image}
                    alt={combo.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brown-900/60 to-transparent" />
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-gold-400 to-gold-600 text-brown-950 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-md">
                    {combo.badge}
                  </span>
                  <div className="absolute bottom-4 left-4 w-10 h-10 bg-white/95 rounded-full flex items-center justify-center shadow-lg">
                    <Icon className="w-5 h-5 text-gold-700" />
                  </div>
                </div>

                <div className="p-7">
                  <h3 className="font-serif text-xl font-semibold text-brown-900 mb-2">
                    {combo.title}
                  </h3>
                  <p className="text-brown-500 text-sm leading-relaxed mb-5">
                    {combo.desc}
                  </p>

                  <div className="flex items-end justify-between mb-5">
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-3xl font-bold text-gold-700">
                        {combo.price}
                      </span>
                      <span className="text-brown-400 line-through text-sm">
                        {combo.originalPrice}
                      </span>
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-1">
                        Save{' '}
                        {Math.round(
                          (1 -
                            parseInt(combo.price.slice(1), 10) /
                              parseInt(combo.originalPrice.slice(1), 10)) *
                            100
                        )}
                        %
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-cream-200">
                    <p className="text-brown-400 text-xs">{combo.note}</p>
                    <a
                      href="#book"
                      className="flex items-center gap-1.5 text-gold-700 text-sm font-medium hover:gap-3 transition-all"
                    >
                      Reserve
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* The Event Planning block was removed from here so it can be its own component */}
      </div>
    </section>
  );
}