import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
// @ts-ignore
import Clappr from 'clappr';

interface ClapprPlayerProps {
  source: string;
  width?: string | number;
  height?: string | number;
  autoPlay?: boolean;
  poster?: string;
  volume?: number;
  muted?: boolean;
  chromeless?: boolean;
  onReady?: (player: any) => void;
  onProgress?: (state: { played: number; playedSeconds: number }) => void;
  onDuration?: (duration: number) => void;
  onEnded?: () => void;
  className?: string;
}

export interface ClapprPlayerRef {
  seekTo: (seconds: number) => void;
  player: any;
}

export const ClapprPlayer = forwardRef<ClapprPlayerRef, ClapprPlayerProps>(({
  source,
  width = '100%',
  height = '100%',
  autoPlay = false,
  poster,
  volume = 1,
  muted = false,
  chromeless = false,
  onReady,
  onProgress,
  onDuration,
  onEnded,
  className
}, ref) => {
  const playerRef = useRef<any>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    seekTo: (seconds: number) => {
      if (playerRef.current) {
        playerRef.current.seek(seconds);
      }
    },
    player: playerRef.current
  }));

  useEffect(() => {
    if (elementRef.current) {
      // Destroy previous instance if exists
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      const player = new Clappr.Player({
        source: source,
        parent: elementRef.current,
        width: '100%',
        height: '100%',
        autoPlay: autoPlay,
        poster: poster,
        chromeless: chromeless,
        playback: {
          playInline: true,
          recycleVideo: true,
        },
        events: {
          onReady: () => {
            if (onReady) onReady(player);
            // Set initial volume
            player.setVolume(muted ? 0 : volume * 100);
            
            // Get initial duration if available
            const duration = player.getDuration();
            if (onDuration && duration) onDuration(duration);
          },
          onTimeUpdate: (progress: { current: number; total: number }) => {
            if (onProgress) {
              onProgress({
                played: progress.total > 0 ? progress.current / progress.total : 0,
                playedSeconds: progress.current
              });
            }
            if (onDuration && progress.total) {
              onDuration(progress.total);
            }
          },
          onEnded: () => {
            if (onEnded) onEnded();
          }
        }
      });

      playerRef.current = player;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [source, autoPlay, poster, chromeless]);

  // Update volume/mute when props change
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(muted ? 0 : volume * 100);
    }
  }, [volume, muted]);

  return (
    <div 
      ref={elementRef} 
      className={`w-full h-full ${className || ''}`} 
      style={{ width, height }} 
    />
  );
});

ClapprPlayer.displayName = 'ClapprPlayer';
