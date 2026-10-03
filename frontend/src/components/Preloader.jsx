import { useEffect, useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { markAppReady } from '@/utils/appReady';

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const finishLoading = () => {
      setTimeout(() => {
        setIsLoading(false);
        document.body.style.overflow = 'auto';
        markAppReady();
      }, 800);
    };

    if (document.readyState === 'complete') {
      finishLoading();
    } else {
      window.addEventListener('load', finishLoading);
      const failsafe = setTimeout(finishLoading, 4000);
      return () => {
        window.removeEventListener('load', finishLoading);
        clearTimeout(failsafe);
      };
    }
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[999999] bg-brown-950 flex flex-col items-center justify-center transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isLoading ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="flex items-center gap-4 overflow-hidden">
        <UtensilsCrossed
          className={`w-8 h-8 text-gold-400 transition-transform duration-1000 ${
            isLoading ? 'translate-y-0' : 'translate-y-20'
          }`}
        />
        <h1
          className={`font-serif text-3xl md:text-5xl text-cream-50 uppercase tracking-[0.3em] transition-transform duration-1000 delay-100 ${
            isLoading ? 'translate-y-0' : 'translate-y-20'
          }`}
        >
          High Spirits
        </h1>
      </div>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-white/10 overflow-hidden">
        <div className="w-full h-full bg-gold-400 origin-left animate-progress" />
      </div>
    </div>
  );
}