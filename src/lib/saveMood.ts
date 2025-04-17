// src/lib/saveMood.ts
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const saveMood = async (userId: string, mood: string) => {
  try {
    await addDoc(collection(db, "moods"), {
      userId,
      mood,
      timestamp: serverTimestamp(),
    });
    console.log("Mood saved:", mood);
  } catch (error) {
    console.error("Error saving mood:", error);
  }
};
