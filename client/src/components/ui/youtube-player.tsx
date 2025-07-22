import React from 'react';

interface YouTubePlayerProps {
  videoId: string;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  width = "100%",
  height = "315",
  className = ""
}) => {
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <iframe
        width={width}
        height={height}
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
};

export default YouTubePlayer;