// src/lib/firestore.ts
import { db } from './firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export const saveMoodToFirestore = async (userId: string, mood: string) => {
  try {
    await addDoc(collection(db, 'moods'), {
      userId,
      mood,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error saving mood:", error);
  }
};
