import { Star, Quote, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

const initialReviews = [
  { name: 'Sophie Laurent', role: 'Food Critic, Le Monde', avatar: 'SL', rating: 5, text: 'High Spirits Cafe is a rare gem. The braised short rib was transcendent.' },
  { name: 'James Whitfield', role: 'Regular Guest', avatar: 'JW', rating: 5, text: 'We celebrated our anniversary here and it exceeded every expectation.' },
  { name: 'Maria Gonzalez', role: 'Travel Blogger', avatar: 'MG', rating: 5, text: 'I have dined at Michelin-starred restaurants across Europe, and High Spirits Cafe stands proudly among the best.' },
];

function Stars({ count, interactive = false, onHover = () => {}, onClick = () => {} }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star 
          key={i} 
          className={`w-5 h-5 ${i < count ? 'fill-amber-500 text-amber-500' : 'text-brown-600'} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`} 
          onMouseEnter={() => interactive && onHover(i + 1)}
          onClick={() => interactive && onClick(i + 1)}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const [reviewList, setReviewList] = useState(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', role: '', text: '', rating: 5 });
  const [hoverRating, setHoverRating] = useState(5);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('animate-in-view');
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [reviewList, showForm]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    const initials = newReview.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const submittedReview = { ...newReview, avatar: initials || 'GU', role: newReview.role || 'Guest' };
    setReviewList([submittedReview, ...reviewList]);
    setNewReview({ name: '', role: '', text: '', rating: 5 });
    setShowForm(false);
  };

  return (
    <section id="reviews" className="py-24 bg-brown-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16" data-reveal>
          <p className="text-gold-400 text-sm font-medium uppercase tracking-[0.25em] mb-3">Testimonials</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-cream-100 mb-4">What Our Guests Say</h2>
          <div className="w-16 gold-divider mx-auto mb-6" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {reviewList.map((r, i) => (
            <div key={r.name + i} data-reveal style={{ transitionDelay: `${(i % 3) * 80}ms` }} className="bg-brown-800 border border-brown-700 rounded-2xl p-7 hover:border-gold-500/50 hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <Quote className="w-8 h-8 text-gold-500/40 mb-4 shrink-0" />
              <p className="text-cream-200/90 leading-relaxed text-sm mb-6 flex-grow">{r.text}</p>
              <div className="flex items-center gap-4 pt-4 border-t border-brown-700/50">
                <div className="w-11 h-11 rounded-full bg-brown-600 flex items-center justify-center text-cream-200 font-semibold text-sm shrink-0">{r.avatar}</div>
                <div>
                  <p className="text-cream-100 font-medium text-sm">{r.name}</p>
                  <p className="text-cream-400/70 text-xs">{r.role}</p>
                </div>
                <div className="ml-auto"><Stars count={r.rating} /></div>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto" data-reveal>
          {!showForm ? (
            <div className="text-center">
              <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-6 py-3 border border-gold-500 text-gold-400 rounded-full hover:bg-gold-500 hover:text-brown-950 transition-colors font-medium shadow-lg">
                <Plus className="w-4 h-4" /> Share Your Experience
              </button>
            </div>
          ) : (
            <div className="bg-brown-800 border border-brown-700 rounded-2xl p-8 animate-fade-in shadow-2xl">
              <h3 className="font-serif text-2xl text-cream-100 font-bold mb-6">Leave a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" placeholder="Your Name" value={newReview.name} onChange={(e) => setNewReview({...newReview, name: e.target.value})} className="w-full bg-brown-900 border border-brown-600 text-cream-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-500" />
                  <input type="text" placeholder="Subtitle (e.g. Guest)" value={newReview.role} onChange={(e) => setNewReview({...newReview, role: e.target.value})} className="w-full bg-brown-900 border border-brown-600 text-cream-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-500" />
                </div>
                <div className="flex items-center gap-3 bg-brown-900 border border-brown-600 rounded-xl px-4 py-3">
                  <span className="text-brown-400 text-sm">Rating:</span>
                  <Stars count={hoverRating || newReview.rating} interactive={true} onHover={setHoverRating} onClick={(val) => setNewReview({...newReview, rating: val})} />
                </div>
                <textarea required placeholder="Tell us about your experience..." value={newReview.text} onChange={(e) => setNewReview({...newReview, text: e.target.value})} rows={3} className="w-full bg-brown-900 border border-brown-600 text-cream-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-500 resize-none" />
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border border-brown-600 text-brown-300 rounded-xl hover:bg-brown-700 transition-colors text-sm font-medium">Cancel</button>
                  <button type="submit" className="flex-1 btn-gold py-3 rounded-xl font-medium shadow-md">Post Review</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}