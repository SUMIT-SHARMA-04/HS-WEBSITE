import { UtensilsCrossed } from 'lucide-react';
import useReveal from '@/components/hooks/useReveal';

const Facebook = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const Instagram = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);

const Twitter = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

export default function Footer() {
  useReveal();

  return (
    <footer className="relative bg-brown-950 text-cream-50 pt-32 pb-8 overflow-hidden border-t border-white/5">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gold-400/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-12 gap-16 md:gap-8 mb-24">

          <div className="md:col-span-5" data-reveal style={{ transitionDelay: '0ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <UtensilsCrossed className="w-6 h-6 text-gold-400" />
              <span className="font-serif text-2xl font-bold text-cream-50 tracking-widest uppercase">
                High Spirits
              </span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm mb-10 font-light">
              A sanctuary of fine dining where tradition meets modern culinary artistry. Every visit is a meticulously crafted chapter in a story of exceptional hospitality.
            </p>

            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-gold-400 hover:border-gold-400 hover:-translate-y-1 transition-all duration-500 group"
                  aria-label="Social link"
                >
                  <Icon className="w-4 h-4 transition-transform duration-500 group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          <div className="hidden md:block md:col-span-2"></div>

          <div className="md:col-span-2" data-reveal style={{ transitionDelay: '150ms' }}>
            <h4 className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em] mb-8">Navigation</h4>
            <ul className="space-y-4">
              {[
                ['Home', '#home'],
                ['About', '#about'],
                ['Menu', '#menu'],
                ['Combos', '#combos'],
                ['Reviews', '#reviews'],
              ].map(([label, href]) => (
                <li key={href}>
                  <a href={href} className="group flex items-center text-white/60 hover:text-cream-50 text-xs font-bold uppercase tracking-widest transition-colors">
                    <span className="w-0 h-[1px] bg-gold-400 mr-0 transition-all duration-300 ease-out group-hover:w-4 group-hover:mr-3"></span>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3" data-reveal style={{ transitionDelay: '300ms' }}>
            <h4 className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em] mb-8">Visit Us</h4>
            <ul className="space-y-6">
              <li className="flex justify-between items-end border-b border-white/10 pb-4">
                <span className="text-white/50 text-xs uppercase tracking-widest">Mon – Sun</span>
                <span className="text-cream-50 text-xs font-bold tracking-wider">9:00 AM – 10:00 PM</span>
              </li>
              <li className="pt-2">
                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Location</p>
                <p className="text-cream-50 text-sm leading-relaxed font-light">
                  Surya Hotel Service Line Road,<br />
                  Bypass, Sangam Colony,<br />
                  Jaipur, Rajasthan 302013
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6" data-reveal style={{ transitionDelay: '450ms' }}>
          <p className="text-[10px] uppercase tracking-widest text-white/40">
            &copy; {new Date().getFullYear()} High Spirits Cafe. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] uppercase tracking-widest text-white/40 hover:text-gold-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-[10px] uppercase tracking-widest text-white/40 hover:text-gold-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
