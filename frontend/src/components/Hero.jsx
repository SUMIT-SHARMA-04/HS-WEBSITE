import { ChevronDown, Star, Users, UtensilsCrossed } from 'lucide-react';
import { useEffect } from 'react';

const heroStats = [
  { icon: Star, num: '4.9', label: 'Average Rating' },
  { icon: Users, num: '50K+', label: 'Guests Served' },
  { icon: UtensilsCrossed, num: '120+', label: 'Menu Items' },
];

export default function Hero() {
  useEffect(() => {
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
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage:
            'url(https://images.pexels.com/photos/10135116/pexels-photo-10135116.jpeg?auto=compress&cs=tinysrgb&h=650&w=940)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-brown-950/75 via-brown-900/65 to-brown-950/90" />

      {/* Decorative floating orbs */}
      <div className="absolute top-1/4 left-10 w-32 h-32 bg-gold-400/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-10 w-40 h-40 bg-brown-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Est badge with gold ring */}
        <div className="inline-flex items-center gap-2 border border-gold-400/40 bg-brown-900/40 backdrop-blur-sm rounded-full px-5 py-2 mb-6 animate-fade-in">
          <span className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-soft-pulse" />
          <p className="text-gold-300 text-xs font-medium uppercase tracking-[0.3em]">
            Est. 2022 &mdash; Fine Dining
          </p>
        </div>

        <h1 className="font-serif text-5xl md:text-7xl font-bold text-cream-50 leading-tight mb-6 animate-slide-up">
          Where Every Meal
          <br />
          <span className="italic shimmer-gold">Tells a Story</span>
        </h1>
        <p className="text-cream-200/90 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.15s' }}>
          Handcrafted dishes rooted in tradition, elevated with passion. Join us
          for an unforgettable culinary journey.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <a
            href="#book"
            className="btn-gold font-medium px-8 py-3.5 rounded-full shadow-lg"
          >
            Book a Table
          </a>
          <a
            href="#menu"
            className="btn-gold-outline font-medium px-8 py-3.5 rounded-full"
          >
            View Menu
          </a>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 md:gap-14 animate-slide-up" style={{ animationDelay: '0.45s' }}>
          {heroStats.map(({ icon: Icon, num, label }) => (
            <div key={label} className="text-center">
              <Icon className="w-5 h-5 text-gold-400 mx-auto mb-2" />
              <p className="font-serif text-2xl md:text-3xl font-bold text-cream-100">
                {num}
              </p>
              <p className="text-cream-300/70 text-xs md:text-sm mt-1 uppercase tracking-wide">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#about"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gold-400/60 hover:text-gold-300 transition-colors animate-bounce"
        aria-label="Scroll down"
      >
        <ChevronDown className="w-7 h-7" />
      </a>
    </section>
  );
}