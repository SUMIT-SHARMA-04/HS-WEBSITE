import { useRef } from 'react';
import { playClickSound } from '@/components/utils/interactions';

export default function MagneticButton({ children, className, onClick, href, type }) {
  const ref = useRef(null);
  const innerRef = useRef(null);

  // Writes transform straight to the DOM instead of React state, so
  // following the cursor doesn't re-render this component on every
  // mousemove over the button.
  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.3;
    const y = (clientY - (top + height / 2)) * 0.3;
    if (ref.current) ref.current.style.transform = `translate(${x}px, ${y}px)`;
    if (innerRef.current) innerRef.current.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = 'translate(0px, 0px)';
    if (innerRef.current) innerRef.current.style.transform = 'translate(0px, 0px)';
  };

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
    >
      <span ref={innerRef} className="transition-transform duration-300 ease-out inline-flex items-center gap-2">
        {children}
      </span>
    </Component>
  );
}
