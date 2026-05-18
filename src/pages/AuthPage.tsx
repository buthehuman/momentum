import { useState } from 'react';
import { supabase } from '../lib/supabase';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          <span className="text-lg text-gray-300">◯</span>
          <span className="text-sm font-medium text-gray-700 tracking-wide">momentum</span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-gray-900 mb-1 text-center">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-sm text-gray-400 mb-8 text-center">
          {mode === 'login'
            ? 'Sign in to continue to your space.'
            : 'Start tracking what matters.'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-500 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              autoComplete={mode === 'login' ? 'email' : 'email'}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none placeholder:text-gray-300 focus:border-gray-400 transition-colors bg-transparent"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-500 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder={mode === 'register' ? 'At least 6 characters' : '••••••'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none placeholder:text-gray-300 focus:border-gray-400 transition-colors bg-transparent"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 py-1">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {loading ? '…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-xs text-gray-400 text-center mt-6">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-gray-600 hover:text-gray-900 underline underline-offset-2 transition-colors"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
