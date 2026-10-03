import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, CheckCircle, Loader, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import useReveal from '@/hooks/useReveal';
import FloatingInput from './FloatingInput';
import { API_BASE } from '@/config/api';

const info = [
  { icon: MapPin, label: 'Location', lines: ['14 no, Out Side of Surya Hotel Service Line Road, Bypass, Sangam Colony, Jaipur, Rajasthan 302013'] },
  { icon: Phone, label: 'Phone', lines: ['+91 9182074513'] },
  { icon: Mail, label: 'Email', lines: ['highspiritscafe99@gmail.com'] },
  { icon: Clock, label: 'Hours', lines: ['Mon – Sun: 9:00 AM – 10:00 PM'] },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  useReveal();

  function set(field, val) { setForm((f) => ({ ...f, [field]: val })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    try {
      const response = await fetch(`${API_BASE}/contact/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!response.ok) throw new Error('Failed to send message');
      setStatus('success'); setForm({ name: '', email: '', message: '' });
    } catch (err) { toast.error('Failed to send message.'); setStatus('idle'); }
  }

  return (
    <section id="contact" className="py-32 bg-brown-950 relative overflow-hidden">
      <div className="bg-animated-grid" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24" data-reveal>
          <p className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Get in Touch</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-cream-50 mb-6">Contact Us</h2>
          <div className="w-12 h-[2px] bg-gold-400 mx-auto" />
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          <div className="order-2 lg:order-1" data-reveal="left">
            <p className="text-white/60 leading-loose mb-12 text-sm font-light">
              Whether you have a question about our menu, want to arrange a private event, or simply want to say hello — our management team is at your service.
            </p>

            <div className="grid sm:grid-cols-2 gap-10 mb-12 border-l border-gold-400/30 pl-6">
              {info.map(({ icon: Icon, label, lines }) => (
                <div key={label}>
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="w-4 h-4 text-gold-400" />
                    <p className="font-bold text-cream-50 text-xs uppercase tracking-widest">{label}</p>
                  </div>
                  {lines.map((l, idx) => (
                    <p key={idx} className="text-white/50 text-xs leading-relaxed">{l}</p>
                  ))}
                </div>
              ))}
            </div>

            <a href="https://maps.app.goo.gl/eEV6LvXyu6XJMEex5" target="_blank" rel="noopener noreferrer" className="group relative block w-full h-48 bg-brown-900 overflow-hidden shadow-xl border border-white/10">
              <img src="https://images.pexels.com/photos/7244274/pexels-photo-7244274.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Restaurant location" className="w-full h-full object-cover opacity-30 group-hover:opacity-20 group-hover:scale-105 transition-all duration-700 ease-out" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border border-gold-400/50 bg-brown-950/80 backdrop-blur-md px-8 py-4 flex items-center gap-3 group-hover:bg-brown-950 transition-colors">
                  <MapPin className="w-4 h-4 text-gold-400" />
                  <span className="text-cream-50 font-bold uppercase tracking-widest text-xs">Get Directions</span>
                  <ExternalLink className="w-3 h-3 text-gold-400/50" />
                </div>
              </div>
            </a>
          </div>

          <div className="order-1 lg:order-2 w-full glass-panel p-8 md:p-12 relative" data-reveal="right">
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gold-400/50 m-4 pointer-events-none hidden md:block" />

            {status === 'success' ? (
              <div className="text-center py-16 animate-fade-in relative z-10">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-8 h-8 text-green-400" /></div>
                <h3 className="font-serif text-3xl font-bold text-cream-50 mb-4">Message Received</h3>
                <p className="text-white/60 mb-8 text-sm">Thank you for reaching out. A member of our team will contact you shortly.</p>
                <button onClick={() => setStatus('idle')} className="text-gold-400 border-b border-gold-400/50 text-xs font-bold uppercase tracking-widest hover:text-gold-300 transition-colors pb-1 active-scale">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 relative z-10 pt-4">
                <h3 className="font-serif text-2xl font-bold text-cream-50 mb-8">Send an Inquiry</h3>

                <FloatingInput id="cName" label="Full Name *" value={form.name} onChange={(e) => set('name', e.target.value)} required dark />
                <FloatingInput id="cEmail" label="Email Address *" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required dark />
                <FloatingInput id="cMessage" label="How can we assist you? *" value={form.message} onChange={(e) => set('message', e.target.value)} required textarea rows={4} dark />

                <button type="submit" disabled={status === 'loading'} className="w-full bg-gold-500 text-brown-950 text-xs font-bold uppercase tracking-[0.2em] py-5 mt-4 hover:bg-gold-400 disabled:opacity-50 transition-colors flex items-center justify-center gap-3 rounded-none active-scale">
                  {status === 'loading' ? <><Loader className="w-4 h-4 animate-spin" /> Transmitting...</> : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
