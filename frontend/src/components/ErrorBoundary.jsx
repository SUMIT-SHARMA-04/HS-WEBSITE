import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-brown-950 text-center p-6">
        <AlertTriangle className="w-12 h-12 text-gold-400 mb-6" />
        <h1 className="font-serif text-2xl font-bold text-cream-50 mb-3">Something went wrong</h1>
        <p className="text-white/60 text-sm max-w-md mb-8 leading-relaxed">
          This section hit an unexpected error. Reloading usually fixes it —
          if it keeps happening, let us know what you were doing.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gold-500 text-brown-950 text-xs font-bold uppercase tracking-[0.2em] px-8 py-4 hover:bg-gold-400 transition-colors active-scale"
        >
          Reload
        </button>
      </div>
    );
  }
}
