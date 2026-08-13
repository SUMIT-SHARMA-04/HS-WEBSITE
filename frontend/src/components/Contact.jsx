import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, CheckCircle, Loader } from 'lucide-react';

const info = [
  {
    icon: MapPin,
    label: 'Location',
    lines: ['24 Rue de la Paix', 'New York, NY 10001'],
  },
  {
    icon: Phone,
    label: 'Phone',
    lines: ['+1 (212) 555-0192'],
  },
  {
    icon: Mail,
    label: 'Email',
    lines: ['hello@highspiritscafe.com'],
  },
  {
    icon: Clock,
    label: 'Hours',
    lines: ['Mon – Fri: 12pm – 10pm', 'Sat – Sun: 11am – 11pm'],
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
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

  function set(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const response = await fetch('http://localhost:8000/contact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      setError('Failed to send your message. Please try again.');
      setStatus('error');
    }
  }

  return (
    <section id="contact" className="py-24 bg-cream-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16" data-reveal>
          <p className="text-gold-600 text-sm font-medium uppercase tracking-[0.25em] mb-3">
            Get in Touch
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-brown-900 mb-4">
            Contact Us
          </h2>
          <div className="w-16 gold-divider mx-auto" />
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Info */}
          <div data-reveal>
            <p className="text-brown-600 leading-relaxed mb-10">
              Whether you have a question about our menu, want to arrange a
              private event, or simply want to say hello — we would love to hear
              from you.
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
                      <p key={l} className="text-brown-500 text-sm">
                        {l}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="mt-10 h-52 bg-brown-100 rounded-2xl overflow-hidden relative">
              <img
                src="https://images.pexels.com/photos/7244274/pexels-photo-7244274.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Restaurant atmosphere"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl px-5 py-3 text-center shadow-md">
                  <MapPin className="w-5 h-5 text-gold-700 mx-auto mb-1" />
                  <p className="font-serif font-semibold text-brown-900 text-sm">
                    24 Rue de la Paix
                  </p>
                  <p className="text-brown-500 text-xs">New York, NY 10001</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white border border-cream-200 rounded-2xl shadow-lg p-8" data-reveal>
            {status === 'success' ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-brown-900 mb-3">
                  Message Sent!
                </h3>
                <p className="text-brown-600 mb-6">
                  Thank you for reaching out. We will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="text-brown-600 underline text-sm hover:text-brown-800 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-serif text-2xl font-semibold text-brown-900 mb-6">
                  Send a Message
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1.5">
                      Name <span className="text-brown-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      placeholder="Your full name"
                      className="w-full border border-cream-300 rounded-xl px-4 py-3 text-brown-900 placeholder-brown-300 form-field transition"
                    />
                  </div>
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
                      className="w-full border border-cream-300 rounded-xl px-4 py-3 text-brown-900 placeholder-brown-300 form-field transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-1.5">
                      Message <span className="text-brown-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => set('message', e.target.value)}
                      placeholder="How can we help you?"
                      className="w-full border border-cream-300 rounded-xl px-4 py-3 text-brown-900 placeholder-brown-300 form-field transition resize-none"
                    />
                  </div>
                  {error && (
                    <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn-gold w-full font-medium py-4 rounded-xl disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      'Send Message'
                    )}
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