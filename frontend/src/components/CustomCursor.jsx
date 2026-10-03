import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('has-custom-cursor');

    // position updates go straight to the DOM (no setState) so mouse
    // movement doesn't trigger a React re-render on every pixel
    const updateCursor = (e) => {
      const { clientX: x, clientY: y } = e;
      if (dotRef.current) { dotRef.current.style.left = `${x}px`; dotRef.current.style.top = `${y}px`; }
      if (ringRef.current) { ringRef.current.style.left = `${x}px`; ringRef.current.style.top = `${y}px`; }
    };
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e) => {
      if (['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName) || e.target.closest('button, a, select, input')) {
        setIsHovering(true);
      } else { setIsHovering(false); }
    };

    window.addEventListener('mousemove', updateCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', updateCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null;

  return (
    <>
      <div ref={dotRef} className="fixed top-0 left-0 w-1.5 h-1.5 bg-gold-400 rounded-full pointer-events-none z-[99999] transform -translate-x-1/2 -translate-y-1/2" />
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[99998] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-out ${isClicking ? 'w-5 h-5 bg-gold-400/30 border-transparent scale-90' : isHovering ? 'w-12 h-12 bg-white/5 backdrop-blur-[1px] border border-white/40 scale-110' : 'w-8 h-8 border border-gold-400/50 scale-100'}`}
      />
    </>
  );
}
