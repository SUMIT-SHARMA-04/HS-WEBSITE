import { useEffect } from 'react';
import { isAppReady, onAppReady } from '@/components/utils/appReady';

// Watches every [data-reveal] element on the page and adds .is-in once
// it scrolls into view. Variants: data-reveal="left" | "right".
// Pass deps when the observed elements depend on async data (e.g. a list
// that loads after a fetch) so we re-scan once they exist.
//
// Anything already in the viewport before the Preloader clears (e.g. the
// Hero section) queues its reveal instead of firing immediately, so the
// fade/slide-in is actually visible once the preloader slides away rather
// than having already completed behind it. A hard 3s failsafe guarantees
// content is never permanently stuck invisible if that signal is ever
// missed for any reason.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
