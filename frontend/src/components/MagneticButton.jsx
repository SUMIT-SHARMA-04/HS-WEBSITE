import { useRef, useState } from 'react';
import { playClickSound } from '@/utils/interactions';

export default function MagneticButton({ children, className, onClick, href, type }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  const handleClick = (e) => {
    playClickSound();
    if (onClick) onClick(e);
  };

  const Component = href ? 'a' : 'button';

  return (
    <Component
      href={href}
      onClick={handleClick}
      type={type}
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      className={`relative inline-flex items-center justify-center transition-transform duration-300 ease-out active-scale ${className}`}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      <span
        className="transition-transform duration-300 ease-out inline-flex items-center gap-2"
        style={{ transform: `translate(${position.x * 0.2}px, ${position.y * 0.2}px)` }}
      >
        {children}
      </span>
    </Component>
  );
}