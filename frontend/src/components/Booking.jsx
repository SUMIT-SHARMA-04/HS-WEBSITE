import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import useReveal from '@/components/hooks/useReveal';
import useLiveSocket from '@/components/hooks/useLiveSocket';
import FloatingInput from './FloatingInput';
import { API_BASE, WS_BASE } from '@/components/config/api';

const timeSlots = ['12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'];
const empty = { name: '', email: '', phone: '', date: '', time: '', guests: '2', special_requests: '', policy: '' };

export default function Booking() {
  const [form, setForm] = useState(empty);
  const [bookingStatus, setBookingStatus] = useState('idle');
  const [liveBookingId, setLiveBookingId] = useState(null);
  const [liveStatus, setLiveStatus] = useState('Pending');
  const [today, setToday] = useState('');

  useEffect(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    setToday(new Date(now.getTime() - offset).toISOString().split('T')[0]);
    const savedBooking = localStorage.getItem('my_active_booking');
    if (savedBooking) { setLiveBookingId(savedBooking); setBookingStatus('tracking'); }
  }, []);

  const isTracking = bookingStatus === 'tracking' && !!liveBookingId;

  // one-time REST check when tracking starts, in case the booking was
  // already decided before the socket connects
  useEffect(() => {
    if (!isTracking) return;
    fetch(`${API_BASE}/bookings/${liveBookingId}/`)
      .then(res => { if (res.ok) return res.json(); if (res.status === 404) setLiveStatus('Rejected'); })
      .then(data => { if (data && data.status) setLiveStatus(data.status); })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTracking, liveBookingId]);

  useLiveSocket(
    `${WS_BASE}/ws/bookings/${liveBookingId}/`,
    {
      onMessage: (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data?.status) setLiveStatus(data.status);
        } catch (e) { console.error('Bad booking WS payload:', e); }
      },
    },
    { enabled: isTracking, restartKey: liveBookingId }
  );

  useReveal([bookingStatus]);

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setBookingStatus('loading');
    const combinedRequests = `[Policy: ${form.policy}] ${form.special_requests}`;
    try {
      const response = await fetch(`${API_BASE}/bookings/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_name: form.name, email: form.email, customer_phone: form.phone, date: form.date, time: form.time, guests: parseInt(form.guests, 10), special_requests: combinedRequests, status: 'Pending' }),
      });
      if (!response.ok) throw new Error('Failed to book table');
      const data = await response.json();
      setLiveBookingId(data.id); setLiveStatus(data.status); localStorage.setItem('my_active_booking', data.id);
      setBookingStatus('tracking'); setForm(empty);
    } catch (err) { toast.error('Booking failed. Please call us directly.'); setBookingStatus('idle'); }
  }

  const closeTracker = () => { setBookingStatus('idle'); localStorage.removeItem('my_active_booking'); };

  if (bookingStatus === 'tracking') {
    return (
      <section id="book" className="py-32 bg-cream-50">
        <div className="max-w-2xl mx-auto px-6 text-center animate-fade-in bg-white p-12 shadow-[0_15px_40px_rgba(38,19,9,0.05)] border border-cream-200">
          {liveStatus === 'Pending' && (
            <><div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-6"><Clock className="w-8 h-8 text-gold-600 animate-pulse" /></div><h2 className="font-serif text-3xl font-bold text-brown-900 mb-4">Request Sent to Host</h2><p className="text-brown-600 leading-relaxed mb-8">Please wait while our host reviews your reservation.</p></>
          )}
          {liveStatus === 'Accepted' && (
            <><div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-8 h-8 text-green-600" /></div><h2 className="font-serif text-3xl font-bold text-brown-900 mb-4">Reservation Confirmed</h2><p className="text-brown-600 leading-relaxed mb-8">We look forward to hosting you.</p><button onClick={closeTracker} className="bg-brown-900 text-gold-400 uppercase tracking-widest text-xs font-bold px-8 py-4 rounded-none hover:bg-brown-800 transition-colors active-scale">Book Another Table</button></>
          )}
          {liveStatus === 'Rejected' && (
            <><div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6"><XCircle className="w-8 h-8 text-red-600" /></div><h2 className="font-serif text-3xl font-bold text-brown-900 mb-4">Fully Booked</h2><p className="text-brown-600 leading-relaxed mb-8">Unfortunately, we cannot accommodate your request at this time.</p><button onClick={closeTracker} className="bg-brown-900 text-gold-400 uppercase tracking-widest text-xs font-bold px-8 py-4 rounded-none hover:bg-brown-800 transition-colors active-scale">Return to Form</button></>
          )}
        </div>
      </section>
    );
  }

  return (
    <section id="book" className="py-32 bg-cream-100 overflow-hidden relative">
      <div className="bg-animated-grid" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          <div className="order-2 lg:order-1" data-reveal="left">
            <p className="text-gold-600 text-xs font-bold uppercase tracking-[0.2em] mb-4">Reservations</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-brown-900 mb-6">Secure Your Table</h2>
            <div className="w-12 h-[2px] bg-gold-400 mb-8" />

            <p className="text-brown-600 leading-loose mb-10 text-sm">
              To ensure a premium and uninterrupted dining experience for all our guests during peak hours, we require an agreement to our dining policy prior to arrival.
            </p>

            <div className="bg-transparent border-l-2 border-gold-400 pl-6 mb-12">
              <p className="text-sm font-bold text-brown-900 mb-2 uppercase tracking-widest">Dining Policy</p>
              <p className="text-sm text-brown-600 leading-relaxed">
                Guests must either order food items from the menu OR agree to a flat ₹200 per person, per hour seating charge for space utilization.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-brown-900/10">
              {[{ icon: Calendar, label: 'Lunch', sub: '12:00 – 2:30 PM' }, { icon: Clock, label: 'Dinner', sub: '6:00 – 10:00 PM' }, { icon: Users, label: 'Capacity', sub: 'Up to 80 guests' },].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-left">
                  <Icon className="w-5 h-5 text-gold-600 mb-3" />
                  <p className="font-bold text-brown-900 text-xs uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-brown-500 text-xs">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 w-full bg-white p-8 md:p-12 shadow-[0_10px_40px_rgba(38,19,9,0.05)] relative" data-reveal="right">
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-gold-400/50 m-4 pointer-events-none hidden md:block" />

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10 pt-2">

              <FloatingInput id="bName" label="Full Name *" value={form.name} onChange={(e) => set('name', e.target.value)} required pattern="^[A-Za-z\s\-\.]{3,50}$" />

              <div className="grid grid-cols-2 gap-8">
                <FloatingInput id="bEmail" label="Email Address *" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
                <FloatingInput id="bPhone" label="Phone Number *" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} required pattern="^[6-9]\d{9}$" />
              </div>

              <FloatingInput id="bRequests" label="Dietary Needs / Requests" value={form.special_requests} onChange={(e) => set('special_requests', e.target.value)} textarea rows={2} />

              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brown-400 font-bold mb-2">Date *</label>
                  <input type="date" required min={today} value={form.date} onChange={(e) => set('date', e.target.value)} className="w-full bg-transparent border-b border-brown-900/30 py-3 text-sm focus:outline-none focus:border-gold-400 text-brown-900 uppercase tracking-wider" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brown-400 font-bold mb-2">Party Size *</label>
                  <select required value={form.guests} onChange={(e) => set('guests', e.target.value)} className="w-full bg-transparent border-b border-brown-900/30 py-3 text-sm focus:outline-none focus:border-gold-400 text-brown-900 cursor-pointer">
                    <option value="" disabled>Select</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (<option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-[10px] uppercase tracking-widest text-brown-400 font-bold mb-2">Dining Policy *</label>
                <select required value={form.policy} onChange={(e) => set('policy', e.target.value)} className="w-full bg-transparent border-b border-brown-900/30 py-3 text-sm focus:outline-none focus:border-gold-400 text-brown-900 cursor-pointer">
                  <option value="" disabled>Select Agreement</option>
                  <option value="Will Order Food">I will order food from the menu</option>
                  <option value="Space Charge Accepted">I am booking space only (₹200/hr/person)</option>
                </select>
              </div>

              <div className="pt-6">
                <label className="block text-[10px] uppercase tracking-widest text-brown-900 font-bold mb-4">Preferred Time *</label>
                <div className="flex flex-wrap gap-3">
                  {timeSlots.map((t) => (
                    <button type="button" key={t} onClick={() => set('time', t)} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 border active-scale ${form.time === t ? 'bg-brown-900 text-gold-400 border-brown-900 shadow-md' : 'bg-transparent text-brown-500 border-brown-900/10 hover:border-gold-400 hover:text-brown-900'}`}>{t}</button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={bookingStatus === 'loading' || !form.time} className="w-full bg-brown-900 text-cream-50 text-xs font-bold uppercase tracking-[0.2em] py-5 mt-6 hover:bg-brown-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-3 rounded-none active-scale">
                {bookingStatus === 'loading' ? <><Loader className="w-4 h-4 animate-spin" /> Transmitting...</> : 'Confirm Request'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
