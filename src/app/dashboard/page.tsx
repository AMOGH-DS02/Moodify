// src/app/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import UserIndicator from '@/components/UserIndicator';

interface MoodEntry {
  id: string;
  mood: string;
  timestamp: {
    seconds: number;
    nanoseconds: number;
  };
}

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        setUserId(user.uid);
        const q = query(
          collection(db, 'moods'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const moodsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MoodEntry[];
        setMoods(moodsData);
        setLoading(false);
      } else {
        setUserId(null);
        setMoods([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <UserIndicator />
      <h1 className="text-3xl font-bold mb-6">Mood History</h1>

      {loading ? (
        <p>Loading...</p>
      ) : moods.length === 0 ? (
        <p>No mood history yet.</p>
      ) : (
        <ul className="space-y-4">
          {moods.map(entry => (
            <li key={entry.id} className="bg-gray-800 p-4 rounded-xl">
              <p><strong>Mood:</strong> {entry.mood}</p>
              <p className="text-sm text-gray-400">
                {new Date(entry.timestamp.seconds * 1000).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
