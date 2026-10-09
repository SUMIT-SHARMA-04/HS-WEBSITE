import { Star } from 'lucide-react';
import usePauseOffscreen from '@/components/hooks/usePauseOffscreen';

export default function Marquee() {
  const words = ['100% PURE VEG', 'JAIPUR', 'FINE DINING', 'EXCEPTIONAL FLAVOR', 'CRAFTED WITH PASSION'];
  const repeatedWords = [...words, ...words, ...words];
  const ref = usePauseOffscreen();

  return (
    <div ref={ref} className="w-full bg-gold-400 py-4 overflow-hidden flex items-center border-y border-brown-950/10">
      <div className="animate-marquee flex items-center">
        {repeatedWords.map((word, i) => (
          <div key={i} className="flex items-center">
            <span className="font-sans font-bold text-brown-950 text-xl md:text-3xl uppercase tracking-widest px-8 whitespace-nowrap">{word}</span>
            <Star className="w-6 h-6 text-brown-900 fill-brown-900" />
          </div>
        ))}
      </div>
    </div>
  );
}
