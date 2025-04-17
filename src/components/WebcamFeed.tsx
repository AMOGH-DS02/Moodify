'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs';

const WebcamFeed = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mood, setMood] = useState<string | null>(null);

  useEffect(() => {
    const loadModelsAndStart = async () => {
      // Set TensorFlow backend
      await tf.setBackend('webgl');
      await tf.ready();
      console.log('TensorFlow backend is ready');

      // Load face-api.js models
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      console.log('Face-api models loaded');

      // Start webcam
      const video = videoRef.current;
      if (video) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          video.srcObject = stream;
        } catch (err) {
          console.error('Error accessing webcam:', err);
        }
      }
    };

    loadModelsAndStart();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;

      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections?.expressions) {
        const sorted = Object.entries(detections.expressions).sort((a, b) => b[1] - a[1]);
        const topMood = sorted[0][0];
        setMood(topMood);

        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          faceapi.matchDimensions(canvas, {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
          });
          const resizedDetections = faceapi.resizeResults(detections, {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
          });
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto mt-4">
      <video
        ref={videoRef}
        autoPlay
        muted
        className="rounded-2xl w-full h-auto shadow-md"
        style={{ transform: 'scaleX(-1)' }}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
      {mood && (
        <div className="mt-4 text-center text-xl font-medium text-white bg-black bg-opacity-70 p-2 rounded-xl">
          Mood detected: <span className="font-bold capitalize">{mood}</span>
        </div>
      )}
    </div>
  );
};

export default WebcamFeed;
