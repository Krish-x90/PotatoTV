import React, { useEffect, useRef } from 'react';
import flowplayer from '@flowplayer/player';
import '@flowplayer/player/flowplayer.css';

interface FlowplayerProps {
  src: string;
  poster?: string;
  token?: string;
  className?: string;
}

export const Flowplayer: React.FC<FlowplayerProps> = ({ src, poster, token, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize player if not already initialized
    if (!playerRef.current) {
      const config: any = {
        src: src,
        token: token || import.meta.env.VITE_FLOWPLAYER_TOKEN
      };
      
      if (poster) {
        config.poster = poster;
      }

      playerRef.current = flowplayer(containerRef.current, config);
    } else {
      // Update src if player exists
      // Check if API supports setSrc, otherwise destroy and recreate
      if (playerRef.current.setSrc) {
        playerRef.current.setSrc(src);
      } else {
        // Fallback: destroy and recreate
        playerRef.current.destroy();
        const config: any = {
            src: src,
            token: token
        };
        if (poster) config.poster = poster;
        playerRef.current = flowplayer(containerRef.current, config);
      }
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [src, poster, token]);

  return <div ref={containerRef} className={`w-full h-full ${className || ''}`} />;
};

export default Flowplayer;
