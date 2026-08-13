import { UtensilsCrossed } from 'lucide-react';

const Facebook = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const Instagram = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);

const Twitter = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

export default function Footer() {
  return (
    <footer className="bg-brown-950 text-cream-200">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <UtensilsCrossed className="w-6 h-6 text-gold-400" />
              <span className="font-serif text-xl font-bold text-cream-100">High Spirits Cafe</span>
            </div>
            <p className="text-cream-400 text-sm leading-relaxed max-w-sm">
              A sanctuary of fine dining where tradition meets innovation. Every
              visit is a new chapter in a story of exceptional food and warm
              hospitality.
            </p>
            <div className="flex gap-4 mt-6">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 bg-brown-800 rounded-full flex items-center justify-center hover:bg-gold-500 transition-colors group"
                  aria-label="Social link"
                >
                  <Icon className="w-4 h-4 text-cream-300 group-hover:text-brown-900 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-serif text-cream-100 font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                ['Home', '#home'],
                ['About', '#about'],
                ['Menu', '#menu'],
                ['Reviews', '#reviews'],
                ['Contact', '#contact'],
                ['Book a Table', '#book'],
              ].map(([label, href]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-cream-400 hover:text-cream-200 text-sm transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Opening hours */}
          <div>
            <h4 className="font-serif text-cream-100 font-semibold mb-4">Opening Hours</h4>
            <ul className="space-y-2.5 text-sm text-cream-400">
              <li className="flex justify-between gap-4">
                <span>Mon – Fri</span>
                <span className="text-cream-300">12pm – 10pm</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Saturday</span>
                <span className="text-cream-300">11am – 11pm</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Sunday</span>
                <span className="text-cream-300">11am – 9pm</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Public Holidays</span>
                <span className="text-cream-300">Closed</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brown-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-cream-500">
          <p>&copy; {new Date().getFullYear()} High Spirits Cafe & Restaurant. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-cream-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cream-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}