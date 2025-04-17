// src/components/MusicPlayer.tsx
'use client';

import YouTube from 'react-youtube';
import { useEffect, useRef, useState } from 'react';
import { moodPlaylists } from '@/lib/playlists';

type Props = {
  mood: string;
  onVideoEnd: () => void;
};

export default function MusicPlayer({ mood, onVideoEnd }: Props) {
  const playerRef = useRef<any>(null);
  const [currentMood, setCurrentMood] = useState(mood);

  useEffect(() => {
    if (playerRef.current && mood !== currentMood) {
      playerRef.current.internalPlayer.stopVideo();
      setCurrentMood(mood);
    }
  }, [mood]);

  return (
    <div className="w-full max-w-xl">
      <YouTube
        ref={playerRef}
        opts={{
          width: '100%',
          playerVars: {
            autoplay: 1,
            listType: 'playlist',
            list: moodPlaylists[mood] || moodPlaylists['neutral'],
          },
        }}
        onEnd={onVideoEnd}
      />
    </div>
  );
}
