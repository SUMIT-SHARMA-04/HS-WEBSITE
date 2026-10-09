import { useEffect, useRef } from 'react';

// Several decorative animations (the aurora glow, the panning grid, film
// grain, the marquee) loop forever once mounted — including for sections
// the user scrolled past minutes ago. On a low-end device that's pure
// waste: GPU cycles spent animating something nobody can see.
//
// Attach the returned ref to the section (or any ancestor) containing
// those animations. It sets a --anim-play-state custom property that the
// animations themselves read (see index.css), defaulting to "running" if
// this hook is ever skipped, so nothing silently breaks.
export default function usePauseOffscreen() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        el.style.setProperty('--anim-play-state', entry.isIntersecting ? 'running' : 'paused');
      },
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}
