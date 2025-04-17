"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";

interface MoodEntry {
  id: string;
  mood: string;
  timestamp: any;
}

const MoodHistory: React.FC = () => {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMoodHistory = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "moodHistory"),
        where("uid", "==", user.uid),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(q);
      const moods: MoodEntry[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        moods.push({
          id: doc.id,
          mood: data.mood,
          timestamp: data.timestamp?.toDate(),
        });
      });

      setMoodHistory(moods);
      setLoading(false);
    };

    fetchMoodHistory();
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mood History</h1>
      {loading ? (
        <p>Loading...</p>
      ) : moodHistory.length === 0 ? (
        <p>No moods detected yet.</p>
      ) : (
        <ul className="space-y-3">
          {moodHistory.map((entry) => (
            <li
              key={entry.id}
              className="p-4 bg-white shadow rounded flex justify-between"
            >
              <span className="capitalize">{entry.mood}</span>
              <span className="text-gray-500 text-sm">
                {entry.timestamp?.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MoodHistory;
