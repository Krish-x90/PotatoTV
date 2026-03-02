import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Settings, Maximize, Play, Pause, Volume2, VolumeX, SkipForward, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '../components/ui/Button';
import { Anime, Episode } from '../types';
import { useUserStore } from '../store/useUserStore';
import { SEO } from '../components/SEO';
import { getAnimeDetails, getAnimeEpisodes } from '../services/tmdb';
import { searchOtakudesu, getOtakudesuAnime, getOtakudesuEpisode } from '../services/otakudesu';
import { searchGogoanime, getGogoanimeAnime, getGogoanimeEpisode } from '../services/gogoanime';
import { UniversalPlayer, UniversalPlayerRef } from '../components/ui/UniversalPlayer';

export const Watch = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const epNum = parseInt(searchParams.get('ep') || '1');
  
  const [anime, setAnime] = useState<Anime | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  
  // Player State
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [quality, setQuality] = useState('1080p');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  
  const { updateHistory } = useUserStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<UniversalPlayerRef>(null);

  const [loading, setLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoSource, setVideoSource] = useState<string>('');
  const [otakudesuSource, setOtakudesuSource] = useState<string | null>(null);
  const [gogoanimeSource, setGogoanimeSource] = useState<string | null>(null);
  const [vidkingUrl, setVidkingUrl] = useState<string | null>(null);
  const [selectedServer, setSelectedServer] = useState<'otakudesu' | 'vidking' | 'trailer' | 'gogoanime'>('vidking');
  
  // Episode Pagination State
  const EPISODES_PER_PAGE = 100;
  const [currentEpisodePage, setCurrentEpisodePage] = useState(0);
  const episodesListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Calculate the page that contains the current episode
    if (epNum > 0) {
      const pageIndex = Math.floor((epNum - 1) / EPISODES_PER_PAGE);
      setCurrentEpisodePage(pageIndex);
    }
  }, [epNum]);

  useEffect(() => {
    // Scroll to active episode when the list updates or page changes
    if (episodesListRef.current) {
      const activeElement = episodesListRef.current.querySelector(`[data-episode="${epNum}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentEpisodePage, epNum, episodes]);

  useEffect(() => {
    const loadAnimeData = async () => {
      if (!id) return;
      
      setLoading(true);
      setVideoError(null);
      setOtakudesuSource(null);
      setGogoanimeSource(null);
      setVidkingUrl(null);
      
      try {
        // Fetch from Kitsu
        const foundAnime = await getAnimeDetails(id);
        const animeEpisodes = await getAnimeEpisodes(id);

        setAnime(foundAnime || null);
        setEpisodes(animeEpisodes);
        
        // Find current episode
        const foundEp = animeEpisodes.find(e => e.number === epNum) || animeEpisodes[0];
        setCurrentEpisode(foundEp || null);
        
        if (foundEp) {
          setVideoSource(foundEp.videoUrl || ''); 

          // Construct VidKing URL
          const [type, tmdbId] = id.split('_');
          if (type === 'movie') {
            setVidkingUrl(`https://vidking.net/embed/movie/${tmdbId}`);
          } else {
            // Try to extract season from ID (format: tv_123_s1_e1)
            const match = foundEp.id.match(/_s(\d+)_e(\d+)/);
            if (match) {
              setVidkingUrl(`https://vidking.net/embed/tv/${tmdbId}/${match[1]}/${match[2]}`);
            } else {
              // Fallback to Season 1
              setVidkingUrl(`https://vidking.net/embed/tv/${tmdbId}/1/${foundEp.number}`);
            }
          }
          
          // Default to VidKing as requested
          setSelectedServer('vidking');
        }

        if (foundAnime) {
          // Try to fetch from Otakudesu
          try {
            const searchResults = await searchOtakudesu(foundAnime.title);
            if (searchResults && searchResults.length > 0) {
              const bestMatch = searchResults[0];
              if (bestMatch) {
                const otakudesuDetails = await getOtakudesuAnime(bestMatch.id);
                if (otakudesuDetails && otakudesuDetails.episodes) {
                  const epMatch = otakudesuDetails.episodes.find((ep: any) => {
                    const match = ep.title.match(/Episode\s+(\d+)/i);
                    return match && parseInt(match[1]) === epNum;
                  });

                  if (epMatch) {
                    const epDetails = await getOtakudesuEpisode(epMatch.id);
                    if (epDetails && epDetails.streamUrl) {
                      setOtakudesuSource(epDetails.streamUrl);
                    }
                  }
                }
              }
            }
          } catch (otaError) {
            console.error("Otakudesu fetch failed:", otaError);
          }

          // Try to fetch from Gogoanime (Dub)
          try {
            const dubQuery = `${foundAnime.title} (Dub)`;
            const dubResults = await searchGogoanime(dubQuery);
            if (dubResults && dubResults.length > 0) {
              // Look for exact match with (Dub)
              const dubMatch = dubResults.find((a: any) => a.title.toLowerCase().includes('(dub)')) || dubResults[0];
              
              if (dubMatch) {
                const gogoDetails = await getGogoanimeAnime(dubMatch.id);
                if (gogoDetails && gogoDetails.episodes) {
                  const epMatch = gogoDetails.episodes.find((ep: any) => ep.number === epNum);
                  if (epMatch) {
                    const epDetails = await getGogoanimeEpisode(epMatch.id);
                    if (epDetails && epDetails.streamUrl) {
                      setGogoanimeSource(epDetails.streamUrl);
                    }
                  }
                }
              }
            }
          } catch (gogoError) {
            console.error("Gogoanime fetch failed:", gogoError);
          }
        }

      } catch (error) {
        console.error("Failed to load anime for watch:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnimeData();
  }, [id, epNum]);

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    setPlayed(state.played);
    if (anime && currentEpisode && state.playedSeconds > 10 && selectedServer !== 'trailer' && selectedServer !== 'vidking') {
      updateHistory(anime.id, currentEpisode.id, state.playedSeconds, {
        title: anime.title,
        poster: anime.poster,
        totalEpisodes: anime.episodes,
        type: anime.id.startsWith('movie') ? 'movie' : 'tv'
      });
    }
  };
  
  // For iframe players (VidKing), we can't track progress easily, so we just mark as watched on load or after a timeout
  useEffect(() => {
    if (selectedServer === 'vidking' && anime && currentEpisode) {
      const timer = setTimeout(() => {
        updateHistory(anime.id, currentEpisode.id, 60, {
          title: anime.title,
          poster: anime.poster,
          totalEpisodes: anime.episodes,
          type: anime.id.startsWith('movie') ? 'movie' : 'tv'
        }); // Mark as started (1 min)
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [selectedServer, anime, currentEpisode, updateHistory]);

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleEnded = () => {
    // Auto play next episode logic
    if (episodes.length > epNum && selectedServer !== 'trailer') {
      setSearchParams({ ep: String(epNum + 1) });
    }
  };

  const handleError = (e: any) => {
    console.error("Video playback error:", e);
    setVideoError("The video stream failed to load.");
  };

  useEffect(() => {
    if (!loading && !videoSource && selectedServer !== 'trailer' && !videoError && selectedServer !== 'vidking') {
      setVideoError("No streaming source found for this episode.");
    }
  }, [loading, videoSource, selectedServer, videoError]);

  const toggleTrailer = () => {
    if (selectedServer === 'trailer') {
      // Switch back to previous server (defaulting to VidKing)
      setSelectedServer('vidking');
      setVideoError(null);
    } else {
      // Switch to trailer
      if (anime?.trailer) {
        setVideoSource(anime.trailer);
        setSelectedServer('trailer');
        setVideoError(null);
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setMuted(!muted);
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
    setMuted(false);
  };
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPlayed = parseFloat(e.target.value);
    setPlayed(newPlayed);
    
    if (playerRef.current) {
      // If we have duration, we can seek to seconds for better compatibility
      if (duration > 0) {
        playerRef.current.seekTo(newPlayed * duration, 'seconds');
      } else {
        playerRef.current.seekTo(newPlayed, 'fraction');
      }
    }
  };
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-purple"></div>
      </div>
    );
  }

  if (!anime || !currentEpisode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-text-secondary">
        <h2 className="text-2xl font-bold mb-2">Episode Not Found</h2>
        <p>The episode you are looking for does not exist or could not be loaded.</p>
        <Link to={`/anime/${id}`} className="mt-4 text-neon-purple hover:underline">Back to Anime Details</Link>
      </div>
    );
  }

  const isTrailerMode = selectedServer === 'trailer';

  // Determine player type and source based on selection
  let playerType: 'react-player' | 'clappr' | 'videojs' | 'iframe' = 'iframe';
  let activeSource = '';

  if (selectedServer === 'trailer') {
    playerType = 'react-player';
    activeSource = videoSource; // Trailer URL
  } else if (selectedServer === 'vidking') {
    playerType = 'iframe';
    activeSource = vidkingUrl || '';
  } else if (selectedServer === 'otakudesu') {
    if (videoSource.includes('.mp4') || videoSource.includes('.m3u8')) {
      playerType = 'clappr';
    } else {
      playerType = 'iframe';
    }
    activeSource = videoSource;
  } else if (selectedServer === 'gogoanime') {
    playerType = 'iframe';
    activeSource = videoSource;
  }

  return (
    <div className="pb-20">
      <SEO 
        title={`Watch ${anime.title} Episode ${currentEpisode.number}`}
        description={`Watch ${anime.title} Episode ${currentEpisode.number} in HD. ${anime.description}`}
        image={currentEpisode.thumbnail}
      />
      <div 
        ref={containerRef}
        className="w-full bg-black relative aspect-video max-h-[80vh] mx-auto group overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {videoError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white p-6 text-center z-10">
            <div className="text-red-500 mb-4 text-4xl">⚠️</div>
            <h3 className="text-xl font-bold mb-2">Stream Unavailable</h3>
            <p className="text-text-secondary max-w-md mb-6">{videoError}</p>
            {anime.trailer && (
              <Button onClick={toggleTrailer} leftIcon={<Maximize size={16} />}>
                Watch Trailer Instead
              </Button>
            )}
          </div>
        ) : (
          <div className="w-full h-full relative z-0" onClick={playerType !== 'iframe' ? togglePlay : undefined}>
            <UniversalPlayer
              ref={playerRef}
              type={playerType}
              source={activeSource}
              poster={currentEpisode.thumbnail}
              autoPlay={true}
              volume={volume}
              muted={muted}
              onProgress={handleProgress}
              onDuration={handleDuration}
              onEnded={handleEnded}
              onError={handleError}
            />
          </div>
        )}
        
        {/* Custom Controls Overlay (Only for non-iframe players) */}
        <AnimatePresence>
          {playerType !== 'iframe' && (!isPlaying || showControls) && !videoError && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 flex flex-col justify-between p-4 pointer-events-none z-10"
            >
              {/* Top Bar */}
              <div className="flex justify-between items-start pointer-events-auto">
                <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded text-xs text-white/90 border border-white/10">
                  {isTrailerMode ? 'Watching Trailer (YouTube)' : (selectedServer === 'otakudesu' ? 'Source: Otakudesu' : (selectedServer === 'gogoanime' ? 'Source: Gogoanime (Dub)' : 'Source: VidKing'))}
                </div>
                {/* Quality Selector */}
                <div className="relative">
                  <button 
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                  >
                    <Settings size={20} />
                  </button>
                  {showQualityMenu && (
                    <div className="absolute top-full right-0 mt-2 bg-secondary-dark border border-white/10 rounded-lg shadow-xl overflow-hidden min-w-[120px]">
                      {['1080p', '720p', '480p', '360p'].map((q) => (
                        <button
                          key={q}
                          onClick={() => { setQuality(q); setShowQualityMenu(false); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 ${quality === q ? 'text-neon-purple font-bold' : 'text-white'}`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Center Play Button (only when paused) */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.button
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={togglePlay}
                    className="w-20 h-20 rounded-full bg-neon-purple/90 flex items-center justify-center text-white shadow-[0_0_30px_rgba(160,32,240,0.5)] pointer-events-auto"
                  >
                    <Play size={40} fill="currentColor" className="ml-2" />
                  </motion.button>
                </div>
              )}

              {/* Bottom Controls */}
              <div className="space-y-2 pointer-events-auto">
                {/* Progress Bar */}
                <div className="flex items-center gap-4 group/progress">
                  <input
                    type="range"
                    min={0}
                    max={0.999999}
                    step="any"
                    value={played}
                    onChange={handleSeekChange}
                    className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-neon-purple [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_#A020F0] hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={togglePlay} className="text-white hover:text-neon-purple transition-colors">
                      {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                    </button>
                    
                    <div className="flex items-center gap-2 group/volume">
                      <button onClick={toggleMute} className="text-white hover:text-neon-purple transition-colors">
                        {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step="any"
                        value={muted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-0 group-hover/volume:w-24 transition-all duration-300 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-neon-purple [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_#A020F0]"
                      />
                    </div>

                    <span className="text-xs font-mono text-white/80">
                      {formatTime(played * duration)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {epNum > 1 && !isTrailerMode && (
                      <button 
                        onClick={() => setSearchParams({ ep: String(epNum - 1) })}
                        className="flex items-center gap-2 text-white hover:text-neon-purple transition-colors text-sm font-bold"
                      >
                        <SkipForward size={16} className="rotate-180" /> Prev Ep
                      </button>
                    )}
                    {epNum < episodes.length && !isTrailerMode && (
                      <button 
                        onClick={() => setSearchParams({ ep: String(epNum + 1) })}
                        className="flex items-center gap-2 text-white hover:text-neon-purple transition-colors text-sm font-bold"
                      >
                        Next Ep <SkipForward size={16} />
                      </button>
                    )}
                    <button onClick={toggleFullscreen} className="text-white hover:text-neon-purple transition-colors">
                      <Maximize size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="container mx-auto px-4 mt-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  {isTrailerMode ? `Trailer: ${anime.title}` : `Episode ${currentEpisode.number}: ${currentEpisode.title}`}
                </h1>
                <Link to={`/anime/${anime.id}`} className="text-neon-purple hover:underline">
                  {anime.title}
                </Link>
              </div>
              <div className="flex gap-2">
                {anime.trailer && (
                  <Button 
                    variant={isTrailerMode ? "primary" : "secondary"} 
                    size="sm" 
                    onClick={toggleTrailer}
                  >
                    {isTrailerMode ? "Back to Episode" : "Watch Trailer"}
                  </Button>
                )}
                {!isTrailerMode && epNum > 1 && (
                  <Link to={`/watch/${id}?ep=${epNum - 1}`}>
                    <Button variant="secondary" size="sm" leftIcon={<ChevronLeft size={16} />}>
                      Prev
                    </Button>
                  </Link>
                )}
                {!isTrailerMode && epNum < episodes.length && (
                  <Link to={`/watch/${id}?ep=${epNum + 1}`}>
                    <Button variant="primary" size="sm" rightIcon={<ChevronRight size={16} />}>
                      Next
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="bg-secondary-dark/50 rounded-xl p-4 border border-white/5 mb-6">
              <div className="flex items-center justify-between text-sm text-text-secondary">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-white">Server:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedServer('vidking')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${selectedServer === 'vidking' ? 'bg-neon-purple text-white' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      VidKing
                    </button>
                    {otakudesuSource && (
                      <button
                        onClick={() => { setSelectedServer('otakudesu'); setVideoSource(otakudesuSource); }}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${selectedServer === 'otakudesu' ? 'bg-neon-purple text-white' : 'bg-white/10 hover:bg-white/20'}`}
                      >
                        Otakudesu
                      </button>
                    )}
                    {gogoanimeSource && (
                      <button
                        onClick={() => { setSelectedServer('gogoanime'); setVideoSource(gogoanimeSource); }}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${selectedServer === 'gogoanime' ? 'bg-neon-purple text-white' : 'bg-white/10 hover:bg-white/20'}`}
                      >
                        Gogoanime (Dub)
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-xs opacity-60">
                    {selectedServer === 'vidking' ? 'High Speed • Multi-Quality' : (selectedServer === 'otakudesu' ? 'Stream optimized' : (selectedServer === 'gogoanime' ? 'English Dub' : 'Alternative player'))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-secondary-dark border border-white/5 rounded-xl overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white">Episodes</h3>
                  <span className="text-xs text-text-secondary">{episodes.length} Total</span>
                </div>
                
                <Link to={`/anime/${id}`} className="flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-colors w-fit">
                  <ChevronLeft size={16} />
                  Back to Details
                </Link>

                {/* Episode Pagination Controls */}
                {episodes.length > EPISODES_PER_PAGE && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.from({ length: Math.ceil(episodes.length / EPISODES_PER_PAGE) }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentEpisodePage(idx)}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                          currentEpisodePage === idx
                            ? 'bg-neon-purple text-white font-bold'
                            : 'bg-white/10 text-text-secondary hover:bg-white/20'
                        }`}
                      >
                        {idx * EPISODES_PER_PAGE + 1}-{Math.min((idx + 1) * EPISODES_PER_PAGE, episodes.length)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div 
                ref={episodesListRef}
                className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar"
              >
                {episodes
                  .slice(currentEpisodePage * EPISODES_PER_PAGE, (currentEpisodePage + 1) * EPISODES_PER_PAGE)
                  .map((ep) => (
                  <Link 
                    key={ep.id}
                    to={`/watch/${id}?ep=${ep.number}`}
                    data-episode={ep.number}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      ep.number === epNum 
                        ? 'bg-neon-purple/20 border border-neon-purple/50' 
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="relative w-24 h-14 rounded overflow-hidden flex-shrink-0 bg-black">
                      <img src={ep.thumbnail} alt={`Ep ${ep.number}`} className="w-full h-full object-cover" />
                      {ep.number === epNum && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-4 h-4 bg-neon-purple rounded-full animate-pulse" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-bold ${ep.number === epNum ? 'text-neon-purple' : 'text-white'}`}>
                          Episode {ep.number}
                        </span>
                        <span className="text-[10px] text-text-secondary">{ep.duration}</span>
                      </div>
                      <p className="text-xs text-text-secondary truncate">{ep.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
