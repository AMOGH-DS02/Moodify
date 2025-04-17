"use client";

import React from "react";

interface YouTubePlayerProps {
  playlistId: string;
  onEnded: () => void;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ playlistId, onEnded }) => {
  // This component assumes that playlistId is passed from your playlists.ts file.
  // It uses the proper embed URL for YouTube playlists.
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

export default YouTubePlayer;
