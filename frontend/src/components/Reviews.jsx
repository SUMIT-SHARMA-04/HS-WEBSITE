import { Star, Quote, Plus, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useReveal from '@/hooks/useReveal';
import FloatingInput from './FloatingInput';
import { API_BASE } from '@/config/api';

function Stars({ count, interactive = false, onHover = () => {}, onClick = () => {} }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 transition-transform ${i < count ? 'fill-gold-400 text-gold-400' : 'text-white/20'} ${interactive ? 'cursor-pointer hover:scale-110' : ''}`}
          onMouseEnter={() => interactive && onHover(i + 1)}
          onClick={() => interactive && onClick(i + 1)}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const [reviewList, setReviewList] = useState([]);
  const [reviewsError, setReviewsError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', role: '', text: '', rating: 5 });
  const [hoverRating, setHoverRating] = useState(5);

  const fetchReviews = async () => {
    setReviewsError(false);
    try {
      const res = await fetch(`${API_BASE}/reviews/`);
      if (!res.ok) throw new Error(`Reviews request failed (${res.status})`);
      const data = await res.json();
      const reviewArray = Array.isArray(data) ? data : data.results || [];
      setReviewList(reviewArray.filter(r => r.is_approved).slice(0, 6));
    } catch (e) {
      console.error(e);
      setReviewsError(true);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  useReveal([reviewList, showForm]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/reviews/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newReview) });
      setShowForm(false); setNewReview({ name: '', role: '', text: '', rating: 5 }); toast.success("Thank you! Review submitted for approval.");
    } catch (e) { toast.error("Error submitting review."); }
  };

  return (
    <section id="reviews" className="py-32 bg-brown-950 relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24" data-reveal>
          <p className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Testimonials</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-cream-50 mb-6">Guest Experiences</h2>
          <div className="w-12 h-[2px] bg-gold-400 mx-auto" />
        </div>

        {reviewsError ? (
          <div className="text-center py-20 mb-12">
            <MessageSquare className="w-10 h-10 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 text-sm font-light tracking-wide mb-4">Couldn't load reviews. Check your connection and try again.</p>
            <button onClick={fetchReviews} className="text-gold-400 hover:text-gold-300 text-xs font-bold uppercase tracking-widest border-b border-gold-400/50 pb-1 transition-colors active-scale">Retry</button>
          </div>
        ) : reviewList.length === 0 ? (
          <div className="text-center py-20 mb-12">
            <MessageSquare className="w-10 h-10 text-white/10 mx-auto mb-4" />
            <h3 className="font-serif text-2xl text-cream-50 mb-2">No reviews yet</h3>
            <p className="text-white/40 text-sm font-light tracking-wide">Be the first to share your dining experience.</p>
          </div>
        ) : (
          <div className="relative max-w-3xl mx-auto pb-32">
            {reviewList.map((r, i) => (
              <div
                key={r.id || i}
                className="sticky top-[12vh] md:top-[15vh] w-full min-h-[40vh] bg-cream-50 rounded-t-[2rem] shadow-[0_-15px_40px_rgba(0,0,0,0.3)] p-8 md:p-14 flex flex-col mb-16 last:mb-0 border-t border-cream-200"
                style={{ zIndex: i }}
              >
                <Quote className="w-10 h-10 text-gold-400 mb-8 shrink-0" />
                <p className="font-serif text-2xl md:text-3xl text-brown-900 leading-snug mb-12 flex-grow">"{r.text}"</p>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-8 border-t border-brown-900/10 mt-auto">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brown-950 flex items-center justify-center text-gold-400 font-serif text-xl">{r.name.substring(0,1).toUpperCase()}</div>
                    <div>
                      <p className="text-brown-900 font-bold text-xs uppercase tracking-widest">{r.name}</p>
                      <p className="text-brown-500 text-[10px] uppercase tracking-widest mt-1">{r.role || 'Guest'}</p>
                    </div>
                  </div>
                  <div className="md:ml-auto"><Stars count={r.rating} /></div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="max-w-xl mx-auto pt-16 border-t border-white/10">
          {!showForm ? (
            <div className="text-center" data-reveal>
              <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-3 text-gold-400 hover:text-gold-300 font-bold uppercase tracking-widest text-xs transition-colors group active-scale"><Plus className="w-4 h-4 group-hover:scale-125 transition-transform" /> Share Your Experience</button>
            </div>
          ) : (
            <div className="animate-side-in" data-reveal="left">
              <div className="flex items-center justify-between mb-8"><h3 className="font-serif text-3xl text-cream-50">Write a Review</h3><button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest active-scale">Cancel</button></div>
              <form onSubmit={handleSubmitReview} className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-8">
                  <FloatingInput id="rName" label="Your Name *" value={newReview.name} onChange={(e) => setNewReview({...newReview, name: e.target.value})} required dark />
                  <FloatingInput id="rRole" label="Subtitle (e.g. Food Critic)" value={newReview.role} onChange={(e) => setNewReview({...newReview, role: e.target.value})} dark />
                </div>
                <div className="flex items-center gap-6 pt-6 pb-2 border-b border-white/20"><span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Rating *</span><Stars count={hoverRating || newReview.rating} interactive={true} onHover={setHoverRating} onClick={(val) => setNewReview({...newReview, rating: val})} /></div>
                <FloatingInput id="rText" label="Share the details... *" value={newReview.text} onChange={(e) => setNewReview({...newReview, text: e.target.value})} required textarea rows={3} dark />
                <button type="submit" className="w-full bg-gold-500 text-brown-950 font-bold uppercase tracking-widest text-xs px-8 py-5 mt-6 hover:bg-gold-400 transition-colors active-scale">Submit for Approval</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
