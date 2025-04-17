// src/components/UserIndicator.tsx
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function UserIndicator() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-xl shadow-md flex items-center space-x-4">
      <span className="text-sm">Logged in as <strong>{user.email}</strong></span>
      <button
        onClick={handleLogout}
        className="text-sm text-red-400 hover:text-red-300 transition"
      >
        Logout
      </button>
    </div>
  );
}
