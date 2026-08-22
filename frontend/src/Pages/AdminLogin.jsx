import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Lock, User, Loader } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('admin_access_token', data.access);
        localStorage.setItem('admin_refresh_token', data.refresh);
        toast.success('Welcome back, Admin!');
        navigate('/admin');
      } else {
        toast.error('Invalid username or password');
      }
    } catch (error) {
      toast.error('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-brown-950 px-6 relative overflow-hidden">
      <Toaster position="top-right" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-brown-900 border border-brown-800 rounded-2xl p-8 shadow-2xl z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brown-800 border border-gold-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <UtensilsCrossed className="w-7 h-7 text-gold-400" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-cream-100 uppercase tracking-wide">High Spirits</h1>
          <p className="text-cream-400 text-xs tracking-widest uppercase mt-1">Staff & Owner Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-cream-300 uppercase tracking-wider mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" />
              <input
                type="text"
                required
                placeholder="admin"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full bg-brown-950 border border-brown-700 rounded-xl pl-11 pr-4 py-3 text-sm text-cream-100 placeholder-brown-500 focus:outline-none focus:border-gold-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-cream-300 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full bg-brown-950 border border-brown-700 rounded-xl pl-11 pr-4 py-3 text-sm text-cream-100 placeholder-brown-500 focus:outline-none focus:border-gold-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gold py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}