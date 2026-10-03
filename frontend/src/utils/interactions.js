let audioCtx = null;

export const playClickSound = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.05);
  } catch (e) {
    // autoplay policies can block this before any user gesture, ignore
  }
};

export const triggerHaptic = () => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(15);
  }
};

// clones the dish image and animates it into the cart icon/FAB
export const flyToCart = (e) => {
  const card = e.currentTarget.closest('.group');
  if (!card) return;
  const img = card.querySelector('img');
  if (!img) return;

  const rect = img.getBoundingClientRect();
  const clone = img.cloneNode(true);

  Object.assign(clone.style, {
    position: 'fixed',
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    zIndex: '999999',
    transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
    pointerEvents: 'none',
    boxShadow: '0 20px 40px rgba(38,19,9,0.4)',
    opacity: '0.9',
    objectFit: 'cover',
  });

  document.body.appendChild(clone);

  const isMobile = window.innerWidth < 768;
  const targetX = isMobile ? window.innerWidth / 2 - 10 : window.innerWidth - 80;
  const targetY = isMobile ? window.innerHeight - 60 : 30;

  requestAnimationFrame(() => {
    Object.assign(clone.style, {
      top: `${targetY}px`,
      left: `${targetX}px`,
      width: '20px',
      height: '20px',
      opacity: '0',
      transform: 'scale(0.5) rotate(15deg)',
    });
  });

  setTimeout(() => clone.remove(), 800);
};
