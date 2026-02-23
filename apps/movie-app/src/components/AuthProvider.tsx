'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthResult {
  error: Error | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInWithMagicLink: (email: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

// ==========================================
// SUPABASE AUTHENTICATION CONTEXT
// ==========================================
// This component wraps the entire Next.js application (see layout.tsx)
// and provides global access to the current `user` state and login/logout methods.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Create a Supabase Client that runs safely in the browser
  const supabase = createClient();

  // 1. Initial Session Check & Realtime Subscription
  useEffect(() => {
    // On Mount: Check if the user is already logged in (reads cookies/localstorage)
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Subscribes to any authentication state changes globally (e.g., user logs in from another tab,
    // or token expires). This guarantees our React `user` state perfectly mirrors Supabase's truth.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Cleanup subscription to prevent memory leaks when component unmounts
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // 2. Auth Methods exposed to the rest of the app
  const signUp = async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // After they click the confirmation email link, Supabase will redirect them here.
        // The `/auth/callback` route will then securely set their cookies.
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithMagicLink = async (email: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Passwordless login: User enters email, clicks link in inbox, and arrives here
        // authenticated securely via URL hashes.
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithMagicLink, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

