'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle } from '@/lib/firebase';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/detect');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/detect');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
      router.push('/detect');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <form onSubmit={handleSignup} className="space-y-4 w-80">
        <h1 className="text-2xl font-bold text-center">Sign Up</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Sign Up with Email
        </button>
      </form>

      <div className="my-4 text-gray-500">or</div>

      <button
        onClick={handleGoogleSignup}
        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M21.35 11.1h-9.19v2.96h5.58c-.25 1.34-1 2.47-2.14 3.23v2.67h3.47c2.04-1.88 3.23-4.66 3.23-7.86 0-.66-.06-1.31-.15-1.94z" />
          <path fill="currentColor" d="M12.16 22c2.7 0 4.96-.9 6.61-2.43l-3.47-2.67c-.96.64-2.2 1.01-3.14 1.01-2.42 0-4.47-1.63-5.2-3.81H3.38v2.74C5.09 19.89 8.39 22 12.16 22z" />
          <path fill="currentColor" d="M6.96 13.1a5.92 5.92 0 0 1 0-3.67V6.7H3.38a9.96 9.96 0 0 0 0 10.6l3.58-2.73z" />
          <path fill="currentColor" d="M12.16 5.5c1.47 0 2.8.5 3.85 1.48l2.9-2.9C17.11 2.61 14.85 2 12.16 2 8.39 2 5.09 4.11 3.38 7.3l3.58 2.73c.73-2.18 2.78-3.81 5.2-3.81z" />
        </svg>
        Sign up with Google
      </button>
    </div>
  );
}
