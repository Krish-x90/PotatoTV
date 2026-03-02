import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Star, Calendar, Clock, Heart, Share2, List } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Anime, Episode } from '../types';
import { useUserStore } from '../store/useUserStore';
import { SEO } from '../components/SEO';
import { getAnimeDetails, getAnimeEpisodes } from '../services/tmdb';

export const AnimeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useUserStore();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnimeDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch from Kitsu API
        const animeData = await getAnimeDetails(id);
        setAnime(animeData);
        
        const episodesData = await getAnimeEpisodes(id);
        setEpisodes(episodesData);
        
        setInWatchlist(isInWatchlist(id));
      } catch (error) {
        console.error("Failed to load anime details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnimeDetails();
  }, [id, isInWatchlist]);

  const toggleWatchlist = () => {
    if (!id) return;
    if (inWatchlist) {
      removeFromWatchlist(id);
    } else {
      addToWatchlist(id);
    }
    setInWatchlist(!inWatchlist);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-purple"></div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-text-secondary">
        <h2 className="text-2xl font-bold mb-2">Anime Not Found</h2>
        <p>The anime you are looking for does not exist or could not be loaded.</p>
        <Link to="/" className="mt-4 text-neon-purple hover:underline">Go back home</Link>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <SEO 
        title={anime.title} 
        description={anime.description}
        image={anime.banner}
        type="video.tv_show"
      />
      {/* Banner */}
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm opacity-50"
          style={{ backgroundImage: `url(${anime.banner})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full md:w-72 flex-shrink-0 mx-auto md:mx-0"
          >
            <div className="rounded-xl overflow-hidden shadow-[0_0_30px_rgba(160,32,240,0.3)] border border-white/10">
              <img src={anime.poster} alt={anime.title} className="w-full h-auto" />
            </div>
            <div className="mt-4 flex gap-2">
              <Button 
                variant={inWatchlist ? "secondary" : "primary"} 
                className="flex-1"
                onClick={toggleWatchlist}
                leftIcon={<Heart size={18} fill={inWatchlist ? "currentColor" : "none"} />}
              >
                {inWatchlist ? 'In Watchlist' : 'Add to List'}
              </Button>
              <Button variant="secondary" className="px-3" onClick={() => {
                const url = window.location.href;
                if (navigator.share) {
                  navigator.share({
                    title: anime.title,
                    text: `Check out ${anime.title} on Potato TV!`,
                    url: url,
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(url).then(() => alert('Link copied to clipboard!')).catch(console.error);
                }
              }}>
                <Share2 size={18} />
              </Button>
            </div>
          </motion.div>

          {/* Info */}
          <div className="flex-1 pt-4 md:pt-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-bold text-white mb-4"
            >
              {anime.title}
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-4 text-sm md:text-base text-text-secondary mb-6"
            >
              <div className="flex items-center gap-1 text-yellow-400 font-bold">
                <Star size={16} fill="currentColor" />
                {anime.rating}
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                {anime.year}
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                {anime.episodes} Episodes
              </div>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white text-xs border border-white/10">
                {anime.status}
              </span>
              <span className="px-2 py-0.5 rounded bg-neon-purple/20 text-neon-purple text-xs border border-neon-purple/30">
                HD
              </span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 mb-6"
            >
              {anime.genres.map((genre) => (
                <Link 
                  key={genre} 
                  to={`/search?genre=${genre}`}
                  className="px-3 py-1 rounded-full bg-secondary-dark border border-white/10 text-xs hover:border-neon-purple hover:text-neon-purple transition-colors"
                >
                  {genre}
                </Link>
              ))}
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-text-secondary leading-relaxed mb-8 text-lg"
            >
              {anime.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link to={`/watch/${anime.id}`}>
                <Button size="lg" leftIcon={<Play size={20} fill="currentColor" />}>
                  Watch Episode 1
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Episodes Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <List className="text-neon-purple" />
            Episodes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {episodes.map((ep, idx) => (
              <Link 
                key={ep.id} 
                to={`/watch/${anime.id}?ep=${ep.number}`}
                className="group flex gap-4 bg-secondary-dark/50 hover:bg-secondary-dark border border-white/5 hover:border-neon-purple/50 rounded-xl p-3 transition-all duration-300"
              >
                <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                  <img 
                    src={ep.thumbnail || anime.poster} 
                    alt={ep.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = anime.poster;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={24} fill="white" className="text-white" />
                  </div>
                  <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1 rounded text-white font-mono">
                    {ep.duration}
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-neon-purple text-xs font-bold mb-1">Episode {ep.number}</span>
                  <h3 className="text-white text-sm font-medium line-clamp-2 group-hover:text-neon-purple transition-colors">
                    {ep.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
