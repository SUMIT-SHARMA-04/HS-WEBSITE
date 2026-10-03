import { useEffect } from 'react';
import { isAppReady, onAppReady } from '@/utils/appReady';


export default function useReveal(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    const cleanups = [];
    const reveal = (el) => el.classList.add('is-in');

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target;
          if (isAppReady()) {
            reveal(target);
            return;
          }
          const unsubscribe = onAppReady(() => reveal(target));
          const failsafe = setTimeout(() => { reveal(target); unsubscribe(); }, 3000);
          cleanups.push(() => { unsubscribe(); clearTimeout(failsafe); });
        });
      },
      { threshold: 0.15 }
    );

    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      cleanups.forEach((fn) => fn());
    };
    
  }, deps);
}