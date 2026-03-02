import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import Player from 'video.js/dist/types/player';

interface VideoJSPlayerProps {
  options: any;
  volume?: number;
  muted?: boolean;
  onReady?: (player: Player) => void;
  onProgress?: (state: { played: number; playedSeconds: number }) => void;
  onDuration?: (duration: number) => void;
  onEnded?: () => void;
  onError?: (error: any) => void;
  className?: string;
}

export interface VideoJSPlayerRef {
  seekTo: (seconds: number) => void;
  player: Player | null;
}

export const VideoJSPlayer = forwardRef<VideoJSPlayerRef, VideoJSPlayerProps>(({
  options,
  volume = 1,
  muted = false,
  onReady,
  onProgress,
  onDuration,
  onEnded,
  onError,
  className
}, ref) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useImperativeHandle(ref, () => ({
    seekTo: (seconds: number) => {
      if (playerRef.current) {
        playerRef.current.currentTime(seconds);
      }
    },
    player: playerRef.current
  }));

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode. 
      const videoElement = document.createElement("video-js");

      videoElement.classList.add('vjs-big-play-centered');
      // Add custom class for styling
      videoElement.classList.add('vjs-custom-theme');
      
      if (videoRef.current) {
        videoRef.current.appendChild(videoElement);
      }

      const player = playerRef.current = videojs(videoElement, options, () => {
        videojs.log('player is ready');
        player.volume(volume);
        player.muted(muted);
        onReady && onReady(player);
      });

      // Event Listeners
      player.on('timeupdate', () => {
        const currentTime = player.currentTime() || 0;
        const duration = player.duration() || 1; // Avoid divide by zero
        if (onProgress) {
          onProgress({
            played: currentTime / duration,
            playedSeconds: currentTime
          });
        }
      });

      player.on('durationchange', () => {
        const duration = player.duration();
        if (onDuration && duration) {
          onDuration(duration);
        }
      });

      player.on('ended', () => {
        if (onEnded) onEnded();
      });

      player.on('error', () => {
        const error = player.error();
        if (onError) onError(error);
      });

    } else {
      const player = playerRef.current;
      
      // Update player options on prop change
      if (options.autoplay !== undefined) {
        player.autoplay(options.autoplay);
      }
      
      if (options.sources) {
        player.src(options.sources);
      }
    }
  }, [options, videoRef]);

  // Update volume/mute when props change
  useEffect(() => {
    const player = playerRef.current;
    if (player) {
      player.volume(volume);
      player.muted(muted);
    }
  }, [volume, muted]);

  // Dispose the player on unmount
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player ref={videoRef} className={`w-full h-full ${className || ''}`} />
  );
});

VideoJSPlayer.displayName = 'VideoJSPlayer';

export default VideoJSPlayer;
