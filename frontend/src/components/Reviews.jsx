import { Star, Quote, Plus, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
  const [reviewList, setReviewList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', role: '', text: '', rating: 5 });
  const [hoverRating, setHoverRating] = useState(5);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_BASE}/reviews/`);
        if (res.ok) {
          const data = await res.json();
          // Filter to only show reviews the owner has approved
          setReviewList(data.filter(r => r.is_approved)); 
        }
      } catch (e) { console.error(e); }
    };
    fetchReviews();
  }, []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/reviews/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      setShowForm(false);
      setNewReview({ name: '', role: '', text: '', rating: 5 });
      alert("Thank you! Your review has been submitted and is pending approval by management.");
    } catch (e) {
      alert("Error submitting review.");
    }
  };

  return (
    <section id="reviews" className="py-24 bg-brown-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-gold-400 text-sm font-medium uppercase tracking-[0.25em] mb-3">Testimonials</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-cream-100 mb-4">What Our Guests Say</h2>
          <div className="w-16 gold-divider mx-auto mb-6" />
        </div>

        {reviewList.length === 0 ? (
          <div className="text-center py-12 mb-12 bg-brown-800/50 border border-brown-700 rounded-3xl">
            <MessageSquare className="w-12 h-12 text-gold-500/30 mx-auto mb-4" />
            <h3 className="font-serif text-xl text-cream-200 mb-2">No reviews yet</h3>
            <p className="text-cream-400 text-sm">Be the first to share your dining experience with us!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {reviewList.map((r, i) => (
              <div key={r.id || i} className="bg-brown-800 border border-brown-700 rounded-2xl p-7 hover:border-gold-500/50 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <Quote className="w-8 h-8 text-gold-500/40 mb-4 shrink-0" />
                <p className="text-cream-200/90 leading-relaxed text-sm mb-6 flex-grow">{r.text}</p>
                <div className="flex items-center gap-4 pt-4 border-t border-brown-700/50">
                  <div className="w-11 h-11 rounded-full bg-brown-600 flex items-center justify-center text-cream-200 font-semibold text-sm shrink-0">
                    {r.name.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-cream-100 font-medium text-sm">{r.name}</p>
                    <p className="text-cream-400/70 text-xs">{r.role || 'Guest'}</p>
                  </div>
                  <div className="ml-auto"><Stars count={r.rating} /></div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          {!showForm ? (
            <div className="text-center">
              <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-6 py-3 border border-gold-500 text-gold-400 rounded-full hover:bg-gold-500 hover:text-brown-950 transition-colors font-medium shadow-lg">
                <Plus className="w-4 h-4" /> Share Your Experience
              </button>
            </div>
          ) : (
            <div className="bg-brown-800 border border-brown-700 rounded-2xl p-8 shadow-2xl">
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
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border border-brown-600 text-brown-300 rounded-xl hover:bg-brown-700 text-sm font-medium">Cancel</button>
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