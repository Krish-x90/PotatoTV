import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import ReactPlayer from 'react-player';
import { ClapprPlayer, ClapprPlayerRef } from './ClapprPlayer';
import { VideoJSPlayer, VideoJSPlayerRef } from './VideoJSPlayer';

interface UniversalPlayerProps {
  type: 'react-player' | 'clappr' | 'videojs' | 'iframe';
  source: string;
  poster?: string;
  autoPlay?: boolean;
  volume?: number;
  muted?: boolean;
  onReady?: (player: any) => void;
  onProgress?: (state: { played: number; playedSeconds: number }) => void;
  onDuration?: (duration: number) => void;
  onEnded?: () => void;
  onError?: (error: any) => void;
  className?: string;
}

export interface UniversalPlayerRef {
  seekTo: (amount: number, type?: 'seconds' | 'fraction') => void;
}

export const UniversalPlayer = forwardRef<UniversalPlayerRef, UniversalPlayerProps>(({
  type,
  source,
  poster,
  autoPlay = true,
  volume = 0.8,
  muted = false,
  onReady,
  onProgress,
  onDuration,
  onEnded,
  onError,
  className
}, ref) => {
  const reactPlayerRef = useRef<ReactPlayer>(null);
  const clapprRef = useRef<ClapprPlayerRef>(null);
  const videoJsRef = useRef<VideoJSPlayerRef>(null);

  useImperativeHandle(ref, () => ({
    seekTo: (amount: number, type: 'seconds' | 'fraction' = 'fraction') => {
      if (type === 'react-player' && reactPlayerRef.current) {
        reactPlayerRef.current.seekTo(amount, type);
      } else if (type === 'clappr' && clapprRef.current) {
         // Clappr wrapper expects seconds. 
         clapprRef.current.seekTo(amount);
      } else if (type === 'videojs' && videoJsRef.current) {
         videoJsRef.current.seekTo(amount);
      }
    }
  }));

  useEffect(() => {
    // Reset refs when type changes? Not strictly necessary as we use different refs.
  }, [type]);

  if (type === 'iframe') {
    return (
      <iframe
        src={source}
        className={`w-full h-full ${className || ''}`}
        frameBorder="0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    );
  }

  if (type === 'clappr') {
    return (
      <ClapprPlayer
        ref={clapprRef}
        source={source}
        poster={poster}
        autoPlay={autoPlay}
        volume={volume}
        muted={muted}
        chromeless={true} // Use custom controls
        onReady={onReady}
        onProgress={onProgress}
        onDuration={onDuration}
        onEnded={onEnded}
        className={className}
      />
    );
  }

  if (type === 'videojs') {
    const videoJsOptions = {
      autoplay: autoPlay,
      controls: false, // We use custom controls
      responsive: true,
      fluid: true,
      sources: [{
        src: source,
        type: source.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
      }]
    };
    return (
      <VideoJSPlayer
        ref={videoJsRef}
        options={videoJsOptions}
        volume={volume}
        muted={muted}
        onReady={onReady}
        onProgress={onProgress}
        onDuration={onDuration}
        onEnded={onEnded}
        onError={onError}
        className={className}
      />
    );
  }

  // Default to ReactPlayer
  return (
    <ReactPlayer
      ref={reactPlayerRef}
      url={source}
      width="100%"
      height="100%"
      controls={false} // We handle controls externally
      playing={autoPlay}
      volume={volume}
      muted={muted}
      onReady={() => onReady && onReady(reactPlayerRef.current)}
      onProgress={onProgress}
      onDuration={onDuration}
      onEnded={onEnded}
      onError={onError}
      config={{
        file: {
          attributes: {
            crossOrigin: 'anonymous',
            playsInline: true,
          },
          forceHLS: source.includes('.m3u8'),
        },
        youtube: {
          playerVars: { showinfo: 0, controls: 0, modestbranding: 1 }
        }
      }}
      className={className}
    />
  );
});

UniversalPlayer.displayName = 'UniversalPlayer';
