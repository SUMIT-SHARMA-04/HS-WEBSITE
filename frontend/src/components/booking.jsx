import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const timeSlots = [
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM',
];

const empty = { name: '', email: '', phone: '', date: '', time: '', guests: '2', special_requests: '', policy: '' };

export default function Booking() {
  const [form, setForm] = useState(empty);
  const [bookingStatus, setBookingStatus] = useState('idle'); 
  const [liveBookingId, setLiveBookingId] = useState(null);
  const [liveStatus, setLiveStatus] = useState('Pending');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const savedBooking = localStorage.getItem('my_active_booking');
    if (savedBooking) {
      setLiveBookingId(savedBooking);
      setBookingStatus('tracking');
    }
  }, []);

  useEffect(() => {
    let interval;
    if (bookingStatus === 'tracking' && liveBookingId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/bookings/${liveBookingId}/`);
          
          if (res.ok) {
            const data = await res.json();
            setLiveStatus(data.status);
            if (data.status === 'Accepted' || data.status === 'Rejected') {
              clearInterval(interval);
            }
          } else if (res.status === 404) {
            // FIXED: If admin deleted the booking, treat it as rejected
            setLiveStatus('Rejected');
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Failed to fetch booking status");
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [bookingStatus, liveBookingId]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('animate-in-view');
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [bookingStatus]);

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setBookingStatus('loading');

    const combinedRequests = `[Policy: ${form.policy}] ${form.special_requests}`;

    try {
      const response = await fetch(`${API_BASE}/bookings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          email: form.email,
          customer_phone: form.phone,
          date: form.date,
          time: form.time,
          guests: parseInt(form.guests, 10),
          special_requests: combinedRequests,
          status: 'Pending'
        }),
      });

      if (!response.ok) throw new Error('Failed to book table');

      const data = await response.json();
      setLiveBookingId(data.id);
      setLiveStatus(data.status);
      localStorage.setItem('my_active_booking', data.id);
      
      setBookingStatus('tracking');
      setForm(empty);
    } catch (err) {
      toast.error('Something went wrong. Please try again or call us directly.');
      setBookingStatus('idle');
    }
  }

  const closeTracker = () => {
    setBookingStatus('idle');
    localStorage.removeItem('my_active_booking');
  };

  if (bookingStatus === 'tracking') {
    return (
      <section id="book" className="py-24 bg-cream-100">
        <div className="max-w-2xl mx-auto px-6 text-center animate-fade-in bg-white p-10 rounded-3xl shadow-xl border border-cream-200">
          
          {liveStatus === 'Pending' && (
            <>
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-amber-600 animate-pulse" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-brown-900 mb-4">Request Sent to Restaurant</h2>
              <p className="text-brown-600 leading-relaxed mb-8">
                Please wait while our staff reviews your request. You will be seated shortly if approved.
              </p>
            </>
          )}

          {liveStatus === 'Accepted' && (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-brown-900 mb-4">Reservation Confirmed!</h2>
              <p className="text-brown-600 leading-relaxed mb-8">
                Your table is ready. Please proceed to the host stand. Thank you for agreeing to our dining policy!
              </p>
              <button onClick={closeTracker} className="btn-gold px-8 py-3.5 rounded-full font-medium">Book Another Table</button>
            </>
          )}

          {liveStatus === 'Rejected' && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-brown-900 mb-4">Reservation Declined</h2>
              <p className="text-brown-600 leading-relaxed mb-8">
                Unfortunately, we cannot accommodate your request at this time. We may be fully booked.
              </p>
              <button onClick={closeTracker} className="btn-gold px-8 py-3.5 rounded-full font-medium">Return to Form</button>
            </>
          )}

        </div>
      </section>
    );
  }

  return (
    <section id="book" className="py-24 bg-cream-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          
          <div className="order-2 lg:order-1" data-reveal>
            <p className="text-gold-600 text-sm font-medium uppercase tracking-[0.25em] mb-3">Reservations</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-brown-900 mb-4">Book a Table</h2>
            <div className="w-16 gold-divider mb-8" />
            <p className="text-brown-600 leading-relaxed mb-4">
              Secure your table at High Spirits Cafe. To ensure a premium experience for all guests during busy hours, we require an agreement to our dining policy.
            </p>
            
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-8">
              <p className="text-sm text-red-800 font-medium">⚠️ Dining Policy</p>
              <p className="text-xs text-red-600 mt-1">Guests must either order food items from the menu OR agree to a flat ₹200 per person, per hour seating charge.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Calendar, label: 'Lunch', sub: '12:00 – 2:30 PM' },
                { icon: Clock, label: 'Dinner', sub: '6:00 – 10:00 PM' },
                { icon: Users, label: 'Capacity', sub: 'Up to 80 guests' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-gradient-to-br from-cream-200 to-gold-50 border border-gold-200 rounded-xl p-4 text-center">
                  <Icon className="w-5 h-5 text-gold-600 mx-auto mb-2" />
                  <p className="font-medium text-brown-800 text-sm">{label}</p>
                  <p className="text-brown-500 text-xs mt-1">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 w-full bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-cream-200" data-reveal>
            <h3 className="font-serif text-2xl font-semibold text-brown-900 mb-6">Reservation Details</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1.5">Table Policy Agreement <span className="text-red-500">*</span></label>
                <select required value={form.policy} onChange={(e) => set('policy', e.target.value)} className="w-full border border-gold-300 bg-gold-50/30 rounded-xl px-4 py-3 text-brown-900 form-field transition text-sm">
                  <option value="" disabled>Select your agreement...</option>
                  <option value="Will Order Food">I agree to order food items from the menu.</option>
                  <option value="Space Charge Accepted">I am booking space only (I accept the ₹200/hr/person charge).</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input type="text" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Your name" className="w-full border border-cream-300 rounded-xl px-4 py-3 text-brown-900 form-field transition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                  <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="email@example.com" className="w-full border border-cream-300 rounded-xl px-4 py-3 text-brown-900 form-field transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1.5">Phone <span className="text-red-500">*</span></label>
                  <input type="tel" required value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 (555) 000-0000" className="w-full border border-cream-300 rounded-xl px-4 py-3 text-brown-900 form-field transition text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1.5">Date <span className="text-red-500">*</span></label>
                  <input type="date" required min={today} value={form.date} onChange={(e) => set('date', e.target.value)} className="w-full border border-cream-300 rounded-xl px-4 py-3 text-brown-900 form-field transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1.5">Guests <span className="text-red-500">*</span></label>
                  <select required value={form.guests} onChange={(e) => set('guests', e.target.value)} className="w-full border border-cream-300 rounded-xl px-4 py-3 text-brown-900 form-field transition text-sm bg-white">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1.5">Preferred Time <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((t) => (
                    <button type="button" key={t} onClick={() => set('time', t)} className={`py-2 text-xs rounded-lg border font-medium transition-all duration-300 ${form.time === t ? 'bg-brown-900 text-white border-brown-900' : 'bg-white text-brown-600 border-cream-300 hover:border-brown-400'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={bookingStatus === 'loading' || !form.time} className="w-full bg-brown-700 text-cream-100 font-medium py-4 rounded-xl hover:bg-brown-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {bookingStatus === 'loading' ? <><Loader className="w-4 h-4 animate-spin" /> Requesting Table…</> : 'Send Request to Staff'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}