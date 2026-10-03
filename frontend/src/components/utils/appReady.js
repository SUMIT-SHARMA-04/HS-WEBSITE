// Content that's already in the viewport (like the Hero section) used to
// finish its fade/slide-in reveal animation while still hidden behind the
// Preloader overlay — so by the time the preloader slid away, everything
// underneath had already silently snapped to its final state. useReveal
// waits on this flag before applying a reveal, so the animation is
// actually visible once the preloader clears.
let ready = false;
const listeners = new Set();

export function markAppReady() {
  if (ready) return;
  ready = true;
  listeners.forEach((cb) => cb());
  listeners.clear();
}

export function onAppReady(cb) {
  if (ready) { cb(); return () => {}; }
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function isAppReady() {
  return ready;
}
