'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Link } from '@/i18n/routing';
import { Heart } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@tmdb/ui';

type AuthMode = 'login' | 'register' | 'magic-link' | 'check-email';

export default function UserMenu() {
  const { user, loading, signUp, signIn, signInWithMagicLink, signOut } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setMode('login');
    setEmail('');
    setPassword('');
    setError('');
    setSubmitting(false);
  };

  const closeModal = () => {
    setShowLoginModal(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    setError('');

    let result;

    if (mode === 'magic-link') {
      result = await signInWithMagicLink(email);
      if (!result.error) {
        setMode('check-email');
        setSubmitting(false);
        return;
      }
    } else if (mode === 'register') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setSubmitting(false);
        return;
      }
      result = await signUp(email, password);
      if (!result.error) {
        setMode('check-email');
        setSubmitting(false);
        return;
      }
    } else {
      result = await signIn(email, password);
      if (!result.error) {
        closeModal();
        return;
      }
    }

    if (result?.error) {
      setError(result.error.message);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
    );
  }

  if (user) {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="outline-none rounded-full ring-offset-2 ring-offset-slate-950 focus:ring-2 focus:ring-accent cursor-pointer">
          <div className="flex items-center gap-2">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata?.full_name || 'User'}
                className="w-8 h-8 rounded-full border border-white/20"
              />
            ) : (
              <div title={user.email} className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold">
                {(user.email?.[0] || 'U').toUpperCase()}
              </div>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-black/80 backdrop-blur-xl border-white/10 text-white">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || 'User'}</p>
              <p className="text-xs leading-none text-slate-400">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem asChild>
            <Link href="/favorites" className="flex items-center gap-2 w-full px-2 py-1.5 cursor-pointer text-sm outline-none transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white rounded-sm">
              <Heart className="w-4 h-4" />
              <span>My Favorites</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem 
            onClick={signOut}
            className="text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer"
          >
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowLoginModal(true)}
        className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg transition-all duration-200 text-sm font-medium text-white cursor-pointer"
      >
        Sign In
      </button>

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {mode === 'check-email' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Check your email</h3>
                <p className="text-slate-400">
                  We sent a confirmation link to <br />
                  <span className="text-white">{email}</span>
                </p>
                <button
                  onClick={resetForm}
                  className="mt-4 text-accent hover:underline cursor-pointer"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-6">
                  {mode === 'login' && 'Sign In'}
                  {mode === 'register' && 'Create Account'}
                  {mode === 'magic-link' && 'Magic Link'}
                </h2>

                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                        required
                      />
                    </div>

                    {(mode === 'login' || mode === 'register') && (
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={mode === 'register' ? 'At least 6 characters' : 'Your password'}
                          className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {error && (
                    <p className="mt-3 text-sm text-red-400">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-6 px-4 py-3 bg-accent hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 text-white font-medium cursor-pointer"
                  >
                    {submitting ? 'Loading...' : (
                      mode === 'login' ? 'Sign In' :
                      mode === 'register' ? 'Create Account' :
                      'Send Magic Link'
                    )}
                  </button>
                </form>

                <div className="mt-6 space-y-3">
                  {mode === 'login' && (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-slate-500 text-sm">or</span>
                        <div className="flex-1 h-px bg-white/10" />
                      </div>
                      <button
                        onClick={() => setMode('magic-link')}
                        className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg transition-all duration-200 text-white cursor-pointer"
                      >
                        Sign in with Magic Link
                      </button>
                      <p className="text-center text-sm text-slate-400">
                        Don't have an account?{' '}
                        <button
                          onClick={() => { setMode('register'); setError(''); }}
                          className="text-accent hover:underline cursor-pointer"
                        >
                          Sign up
                        </button>
                      </p>
                    </>
                  )}

                  {mode === 'register' && (
                    <p className="text-center text-sm text-slate-400">
                      Already have an account?{' '}
                      <button
                        onClick={() => { setMode('login'); setError(''); }}
                        className="text-accent hover:underline cursor-pointer"
                      >
                        Sign in
                      </button>
                    </p>
                  )}

                  {mode === 'magic-link' && (
                    <>
                      <p className="text-center text-sm text-slate-500">
                        We'll send you a link to sign in instantly.
                      </p>
                      <p className="text-center text-sm text-slate-400">
                        <button
                          onClick={() => { setMode('login'); setError(''); }}
                          className="text-accent hover:underline cursor-pointer"
                        >
                          Back to password login
                        </button>
                      </p>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
