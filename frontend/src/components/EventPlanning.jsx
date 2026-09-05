import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

export default function EventPlanning() {
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
    <section id="events" className="py-16 bg-cream-50 px-6">
      <div className="max-w-7xl mx-auto">
        <div
          data-reveal
          className="bg-brown-800 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 opacity-20">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage:
                  'url(https://images.pexels.com/photos/38598631/pexels-photo-38598631.jpeg?auto=compress&cs=tinysrgb&h=650&w=940)',
              }}
            />
          </div>
          <div className="relative z-10">
            <h3 className="font-serif text-3xl md:text-4xl font-bold text-cream-100 mb-4">
              Planning a Private Event or Party?
            </h3>
            <p className="text-cream-300/90 max-w-xl mx-auto mb-8 text-lg leading-relaxed">
              From intimate gatherings to grand celebrations, we create bespoke
              dining experiences tailored to your occasion. Let us make your special night unforgettable.
            </p>
            <a
              href="#contact"
              className="btn-gold inline-flex items-center gap-2 font-medium px-8 py-4 rounded-full shadow-lg hover:-translate-y-1 transition-transform"
            >
              Enquire Now
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}