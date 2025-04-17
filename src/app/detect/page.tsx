// src/app/detect/page.tsx
"use client";
import * as React from 'react';
//import React from "react";
import MoodDetector from "@/components/MoodDetector"; // Make sure this component exists

export default function DetectPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Moodify - Detect Your Mood</h1>
      <MoodDetector />
    </div>
  );
}
