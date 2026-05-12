"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if first-time setup is needed
    fetch('/api/admin/setup').then(r => r.json()).then(d => {
      if (!d.completed) router.replace('/admin/setup');
      else setChecking(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) router.push('/admin');
    else {
      const d = await res.json();
      setError(d.error || 'Incorrect password.');
      setLoading(false);
    }
  };

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-sand-600" />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-stone-100">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock size={28} className="text-white" />
          </div>
          <h1 className="font-serif text-3xl text-stone-900">Admin Panel</h1>
          <p className="text-stone-400 text-sm mt-1">Apartments Dekanić</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">Password</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)} required autoFocus
                className="w-full px-4 py-3 pr-11 rounded-xl border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-sand-400 transition-all"
                placeholder="Enter your admin password" />
              <button type="button" onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-xs text-center font-medium bg-red-50 py-2 px-3 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-sand-600 hover:bg-sand-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
