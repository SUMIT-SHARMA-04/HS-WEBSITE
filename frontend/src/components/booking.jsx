import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, Loader } from 'lucide-react';

const timeSlots = [
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM',
];

const empty = {
  name: '', email: '', phone: '', date: '', time: '', guests: '2', special_requests: '',
};

export default function Booking() {
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

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

  const today = new Date().toISOString().split('T')[0];

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const response = await fetch('http://localhost:8000/bookings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: form.name,
          email: form.email,
          customer_phone: form.phone,
          date: form.date,
          time: form.time,
          guests: parseInt(form.guests, 10),
          special_requests: form.special_requests || '',
          status: 'Pending'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to book table');
      }

      setStatus('success');
      setForm(empty);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again or call us directly.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <section id="book" className="py-24 bg-cream-100">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-brown-900 mb-4">
            Reservation Confirmed!
          </h2>
          <p className="text-brown-600 leading-relaxed mb-8">
            Thank you for choosing High Spirits Cafe & Restaurant. We have received your reservation request
            and will send a confirmation to your email shortly. We look forward to welcoming you.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="bg-gradient-to-br from-gold-400 to-gold-600 text-brown-950 px-8 py-3.5 rounded-full font-medium hover:scale-105 transition-transform"
          >
            Make Another Reservation
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="book" className="py-24 bg-cream-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left – info */}
          <div data-reveal>
            <p className="text-gold-600 text-sm font-medium uppercase tracking-[0.25em] mb-3">
              Reservations
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-brown-900 mb-4">
              Book a Table
            </h2>
            <div className="w-16 gold-divider mb-8" />
            <p className="text-brown-600 leading-relaxed mb-8">
              Secure your table at High Spirits Cafe & Restaurant and let us take care of the rest.
              For parties of 10 or more, please call us directly so we can tailor
              the experience to your group.
            </p>

            <img
              src="https://images.pexels.com/photos/32568165/pexels-photo-32568165.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
              alt="Restaurant interior"
              className="w-full h-64 object-cover rounded-2xl shadow-lg"
            />

            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { icon: Calendar, label: 'Lunch', sub: '12:00 – 2:30 PM' },
                { icon: Clock, label: 'Dinner', sub: '6:00 – 10:00 PM' },
                { icon: Users, label: 'Capacity', sub: 'Up to 80 guests' },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="bg-gradient-to-br from-cream-200 to-gold-50 border border-gold-200 rounded-xl p-4 text-center"
                >
                  <Icon className="w-5 h-5 text-gold-600 mx-auto mb-2" />
                  <p className="font-medium text-brown-800 text-sm">{label}</p>
                  <p className="text-brown-500 text-xs mt-1">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right – form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-cream-200" data-reveal>
            <h3 className="font-serif text-2xl font-semibold text-brown-900 mb-6">
              Reservation Details
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1.5">
                  Full Name <span className="text-brown-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Your name"
                  className="w-full border border-cream-300 rounded-xl px-4 py-3 text-brown-900 placeholder-brown-300 form-field transition"
                />
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1.5">
                    Email <span className="text-brown-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="email@example.com"
                    className="w-full border border-cream-300 rounded-xl px-4 py-3 text-brown-900 placeholder-brown-300 form-field transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1.5">
                    Phone <span className="text-brown-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full border border-cream-300 rounded-xl px-4 py-3 text-brown-900 placeholder-brown-300 form-field transition text-sm"
                  />
                </div>
              </div>

              {/* Date + Guests */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1.5">
                    Date <span className="text-brown-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={today}
                    value={form.date}
                    onChange={(e) => set('date', e.target.value)}
                    className="w-full border border-cream-300 rounded-xl px-4 py-3 text-brown-900 form-field transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-1.5">
                    Guests <span className="text-brown-400">*</span>
                  </label>
                  <select
                    required
                    value={form.guests}
                    onChange={(e) => set('guests', e.target.value)}
                    className="w-full border border-cream-300 rounded-xl px-4 py-3 text-brown-900 form-field transition text-sm bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1.5">
                  Preferred Time <span className="text-brown-400">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => set('time', t)}
                      className={`py-2 text-xs rounded-lg border font-medium transition-all duration-300 ${
                        form.time === t
                          ? 'tab-active'
                          : 'tab-inactive'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special requests */}
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1.5">
                  Special Requests
                </label>
                <textarea
                  rows={3}
                  value={form.special_requests}
                  onChange={(e) => set('special_requests', e.target.value)}
                  placeholder="Dietary requirements, celebrations, seating preferences…"
                  className="w-full border border-cream-300 rounded-xl px-4 py-3 text-brown-900 placeholder-brown-300 form-field transition resize-none text-sm"
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !form.time}
                className="w-full bg-brown-700 text-cream-100 font-medium py-4 rounded-xl hover:bg-brown-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Reserving…
                  </>
                ) : (
                  'Confirm Reservation'
                )}
              </button>
              <p className="text-center text-brown-400 text-xs">
                You will receive a confirmation email within 30 minutes.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}