import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, CheckCircle, Loader, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// UPDATED: Localized to Jaipur, Rajasthan
const info = [
  { icon: MapPin, label: 'Location', lines: ['C-Scheme', 'Jaipur, Rajasthan 302001'] },
  { icon: Phone, label: 'Phone', lines: ['+91 98765 43210'] },
  { icon: Mail, label: 'Email', lines: ['hello@highspiritscafe.com'] },
  { icon: Clock, label: 'Hours', lines: ['Mon – Fri: 12pm – 10pm', 'Sat – Sun: 11am – 11pm'] },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('animate-in-view');
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function set(field, val) { setForm((f) => ({ ...f, [field]: val })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch(`${API_BASE}/contact/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error('Failed to send message');

      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      toast.error('Failed to send your message. Please try again.');
      setStatus('idle');
    }
  }

  return (
    <section id="contact" className="py-24 bg-cream-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16" data-reveal>
          <p className="text-gold-600 text-sm font-medium uppercase tracking-[0.25em] mb-3">Get in Touch</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-brown-900 mb-4">Contact Us</h2>
          <div className="w-16 gold-divider mx-auto" />
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="order-2 lg:order-1" data-reveal>
            <p className="text-brown-600 leading-relaxed mb-10">
              Whether you have a question about our menu, want to arrange a private event, or simply want to say hello — we would love to hear from you.
            </p>
            <div className="space-y-8">
              {info.map(({ icon: Icon, label, lines }) => (
                <div key={label} className="flex gap-5">
                  <div className="w-12 h-12 bg-gradient-to-br from-gold-100 to-gold-200 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-gold-700" />
                  </div>
                  <div>
                    <p className="font-medium text-brown-800 mb-1">{label}</p>
                    {lines.map((l) => (
                      <p key={l} className="text-brown-500 text-sm">{l}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* UPDATED: Google Maps redirect link for Jaipur */}
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=C-Scheme,+Jaipur,+Rajasthan" 
              target="_blank" rel="noopener noreferrer"
              className="mt-10 h-52 bg-brown-100 rounded-2xl overflow-hidden relative block group cursor-pointer border-2 border-transparent hover:border-gold-400 transition-all duration-300 shadow-md hover:shadow-xl"
            >
              <img src="https://images.pexels.com/photos/7244274/pexels-photo-7244274.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Restaurant location" className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl px-5 py-3 text-center shadow-md group-hover:bg-gold-50 transition-colors">
                  <MapPin className="w-5 h-5 text-gold-700 mx-auto mb-1" />
                  <p className="font-serif font-semibold text-brown-900 text-sm flex items-center gap-2 justify-center">
                    C-Scheme, Jaipur <ExternalLink className="w-3 h-3 text-brown-400" />
                  </p>
                  <p className="text-brown-500 text-xs">Rajasthan 302001</p>
                </div>
              </div>
            </a>
          </div>

          <div className="order-1 lg:order-2 w-full bg-white border border-cream-200 rounded-2xl shadow-lg p-6 md:p-8" data-reveal>
            {status === 'success' ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-brown-900 mb-3">Message Sent!</h3>
                <p className="text-brown-600 mb-6">Thank you for reaching out. We will get back to you within 24 hours.</p>
                <button onClick={() => setStatus('idle')} className="text-brown-600 underline text-sm hover:text-brown-800 transition-colors">Send another message</button>
              </div>
            ) : (
              <>
                <h3 className="font-serif text-2xl font-semibold text-brown-900 mb-6">Send a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1.5">Name <span className="text-brown-400">*</span></label>
                    <input type="text" required value={form.name} onChange={(e) => set('name', e.target.value)} className="w-full border border-cream-300 rounded-xl px-4 py-3 text-brown-900 form-field transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1.5">Email <span className="text-brown-400">*</span></label>
                    <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} className="w-full border border-cream-300 rounded-xl px-4 py-3 text-brown-900 form-field transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1.5">Message <span className="text-brown-400">*</span></label>
                    <textarea required rows={5} value={form.message} onChange={(e) => set('message', e.target.value)} className="w-full border border-cream-300 rounded-xl px-4 py-3 text-brown-900 form-field transition resize-none" />
                  </div>
                  <button type="submit" disabled={status === 'loading'} className="btn-gold w-full font-medium py-4 rounded-xl disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                    {status === 'loading' ? <><Loader className="w-4 h-4 animate-spin" /> Sending…</> : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}