"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import { moodPlaylists } from "@/lib/playlists";
import { auth } from "@/lib/firebase";
import { saveMood } from "@/lib/saveMood";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CircleLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Define mood-based gradients (Tailwind classes)
const moodGradients: { [key: string]: string[] } = {
  happy: ["from-yellow-400", "to-orange-500"],
  sad: ["from-blue-600", "to-blue-800"],
  angry: ["from-red-600", "to-red-800"],
  surprised: ["from-pink-500", "to-pink-700"],
  neutral: ["from-gray-400", "to-gray-600"],
  fearful: ["from-purple-600", "to-purple-800"],
  disgusted: ["from-green-600", "to-green-800"],
  "No face detected": ["from-gray-700", "to-gray-900"],
  default: ["from-gray-100", "to-gray-300"],
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: "easeInOut" } },
};

const videoVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const YouTubePlayer = ({
  playlistId,
  onEnded,
}: {
  playlistId: string;
  onEnded: () => void;
}) => {
  return (
    <div className="w-full aspect-video mt-4">
      <iframe
        className="rounded-xl shadow-lg w-full h-full"
        src={`https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1`}
        title="Mood Playlist"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

function MoodDetectorEnhanced() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [user] = useAuthState(auth);
  const router = useRouter();

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Error loading models:", err);
        setError("Failed to load face detection models. Please refresh.");
      }
    };
    loadModels();
  }, []);

  // Start webcam stream
  const startVideo = useCallback(async () => {
    if (isVideoOn || !videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 360, facingMode: "user" },
      });
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
        setIsVideoOn(true);
      };
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Could not access camera. Please allow webcam permission.");
    }
  }, [isVideoOn]);

  const stopVideo = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsVideoOn(false);
    }
  }, []);

  const detectMood = useCallback(async () => {
    if (!videoRef.current || !modelsLoaded || isDetecting) return;

    setIsLoading(true);
    setIsDetecting(true);
    setError(null);

    try {
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        )
        .withFaceExpressions();

      if (detection && detection.expressions) {
        const sorted = Object.entries(detection.expressions).sort((a, b) => b[1] - a[1]);
        const detectedMood = sorted[0][0];

        setCurrentMood(detectedMood);
        setPlaylistId(moodPlaylists[detectedMood] || moodPlaylists.neutral);

        if (user) {
          try {
            await saveMood(user.uid, detectedMood);
          } catch (saveError) {
            console.error("Error saving mood:", saveError);
          }
        }
      } else {
        setCurrentMood("No face detected");
        setPlaylistId(moodPlaylists.neutral);
        setError("No face detected. Try again.");
      }
    } catch (err) {
      console.error("Mood detection error:", err);
      setError("Something went wrong during mood detection.");
    } finally {
      setIsLoading(false);
      setIsDetecting(false);
    }
  }, [modelsLoaded, user, isDetecting]);

  const handleDetectClick = () => {
    if (!modelsLoaded) {
      setError("Models still loading...");
      return;
    }
    if (!isVideoOn) {
      startVideo().then(() => {
        setTimeout(() => detectMood(), 1500);
      });
    } else {
      detectMood();
    }
  };

  useEffect(() => {
    return () => {
      stopVideo();
    };
  }, [stopVideo]);

  const gradientClass = (mood: string | null) => {
    const gradient = moodGradients[mood || "default"] || moodGradients.default;
    return gradient.join(" ");
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "h-screen w-screen flex flex-col items-center justify-center px-4 py-6",
        "bg-gradient-to-b",
        gradientClass(currentMood)
      )}
    >
      <div className="max-w-md w-full space-y-6">
        <motion.div variants={videoVariants} initial="hidden" animate="visible">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="rounded-lg w-full shadow-lg border border-white/30 aspect-video object-cover"
          />
        </motion.div>

        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            onClick={handleDetectClick}
            disabled={isLoading || isDetecting}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-full shadow-lg text-lg"
          >
            {isLoading ? "Detecting..." : "Detect Your Mood"}
          </Button>
        </motion.div>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {currentMood && (
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white text-center"
          >
            Mood: <span className="capitalize">{currentMood}</span>
          </motion.h2>
        )}

        {playlistId && (
          <YouTubePlayer
            playlistId={playlistId}
            onEnded={() => {
              // No auto-re-detect; user can manually click again
            }}
          />
        )}

        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-white/20 text-white border border-white/30 py-3 px-6 rounded-full shadow-md hover:bg-white/30 transition"
          >
            View Mood History
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default MoodDetectorEnhanced;
