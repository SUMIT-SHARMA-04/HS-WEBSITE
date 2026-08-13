import { Star, Quote } from 'lucide-react';
import { useEffect } from 'react';

const reviews = [
  {
    name: 'Sophie Laurent',
    role: 'Food Critic, Le Monde',
    avatar: 'SL',
    rating: 5,
    text: 'High Spirits Cafe is a rare gem. The braised short rib was transcendent — each element on the plate had a purpose, and the harmony they created was nothing short of magical. One of the finest dining experiences I have had in years.',
  },
  {
    name: 'James Whitfield',
    role: 'Regular Guest',
    avatar: 'JW',
    rating: 5,
    text: 'We celebrated our anniversary here and it exceeded every expectation. The staff remembered our preferences from a visit two years prior — that kind of attention to detail is what separates truly great restaurants from the rest.',
  },
  {
    name: 'Maria Gonzalez',
    role: 'Travel Blogger',
    avatar: 'MG',
    rating: 5,
    text: 'I have dined at Michelin-starred restaurants across Europe, and High Spirits Cafe stands proudly among the best. The seasonal tasting menu was a revelation — inventive without being gimmicky, with flavours that stayed with me long after.',
  },
  {
    name: 'David Chen',
    role: 'Local Resident',
    avatar: 'DC',
    rating: 5,
    text: 'The atmosphere is warm and elegant — never stuffy. You feel instantly at home. The truffle arancini alone are worth the visit. My family has made this our go-to spot for every special occasion.',
  },
  {
    name: 'Isabelle Moreau',
    role: 'Event Planner',
    avatar: 'IM',
    rating: 5,
    text: 'I have organised many corporate dinners here and the team is always impeccable. They anticipate every need before you even have to ask. Clients are invariably impressed — it reflects beautifully on the events we run.',
  },
  {
    name: 'Thomas Reed',
    role: 'Sommelier, Bordeaux',
    avatar: 'TR',
    rating: 5,
    text: 'As a professional in the industry, I am very critical. The wine programme at High Spirits Cafe & Restaurant is genuinely excellent — well-curated, fairly priced, and the pairing suggestions were spot on. A restaurant that truly understands hospitality.',
  },
];

function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
      ))}
    </div>
  );
}

export default function Reviews() {
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
    <section id="reviews" className="py-24 bg-brown-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16" data-reveal>
          <p className="text-gold-400 text-sm font-medium uppercase tracking-[0.25em] mb-3">
            Testimonials
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-cream-100 mb-4">
            What Our Guests Say
          </h2>
          <div className="w-16 gold-divider mx-auto mb-6" />
          <p className="text-cream-300/80 max-w-xl mx-auto leading-relaxed">
            Over 50,000 guests have trusted us with their most cherished
            moments. Here is what they have to say.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div
              key={r.name}
              data-reveal
              style={{ transitionDelay: `${i * 80}ms` }}
              className="bg-brown-800 border border-brown-700 rounded-2xl p-7 hover:border-gold-500/50 hover:-translate-y-1 transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-gold-500/40 mb-4" />
              <p className="text-cream-200/90 leading-relaxed text-sm mb-6">
                {r.text}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-brown-600 flex items-center justify-center text-cream-200 font-semibold text-sm shrink-0">
                  {r.avatar}
                </div>
                <div>
                  <p className="text-cream-100 font-medium text-sm">{r.name}</p>
                  <p className="text-cream-400/70 text-xs">{r.role}</p>
                </div>
                <div className="ml-auto">
                <Stars count={r.rating} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary bar */}
        <div className="mt-16 bg-brown-800/60 border border-brown-700 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-around gap-6 text-center" data-reveal>
          {[
            { num: '4.9 / 5', label: 'Average Rating' },
            { num: '2,400+', label: 'Reviews on Google' },
            { num: '98%', label: 'Would Recommend' },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-serif text-3xl font-bold text-cream-200">{s.num}</p>
              <p className="text-cream-400/80 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}