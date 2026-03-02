import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Star, Plus, Check, Heart, Share2 } from 'lucide-react';
import { Anime } from '../../types';
import { useUserStore } from '../../store/useUserStore';

interface AnimeCardProps {
  anime: Anime;
  index?: number;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, index = 0 }) => {
  const { watchlist, toggleWatchlist, favorites, addToFavorites, removeFromFavorites, isFavorite } = useUserStore();
  const isInWatchlist = watchlist.includes(anime.id);
  const isFav = isFavorite(anime.id);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(anime.id);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFav) {
      removeFromFavorites(anime.id);
    } else {
      addToFavorites(anime.id);
    }
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/anime/${anime.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: anime.title,
          text: `Check out ${anime.title} on Potato TV!`,
          url: url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative w-full"
    >
      <Link to={`/anime/${anime.id}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-secondary-dark border border-white/5 shadow-lg group-hover:shadow-[0_0_25px_rgba(160,32,240,0.4)] group-hover:border-neon-purple/50 transition-all duration-300">
          <img
            src={anime.poster}
            alt={anime.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Action Buttons (Top Left) */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
            {/* Watchlist Button */}
            <button
              onClick={handleWatchlistClick}
              className={`p-1.5 rounded-md backdrop-blur-md transition-all duration-300 ${
                isInWatchlist 
                  ? 'bg-neon-purple text-white shadow-[0_0_10px_#A020F0]' 
                  : 'bg-black/60 text-white/70 hover:bg-white hover:text-black hover:scale-110'
              }`}
              title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              {isInWatchlist ? <Check size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
            </button>

            {/* Favorite Button */}
            <button
              onClick={handleFavoriteClick}
              className={`p-1.5 rounded-md backdrop-blur-md transition-all duration-300 ${
                isFav 
                  ? 'bg-red-500 text-white shadow-[0_0_10px_#EF4444]' 
                  : 'bg-black/60 text-white/70 hover:bg-white hover:text-red-500 hover:scale-110'
              }`}
              title={isFav ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Heart size={14} fill={isFav ? "currentColor" : "none"} strokeWidth={3} />
            </button>

            {/* Share Button */}
            <button
              onClick={handleShareClick}
              className="p-1.5 rounded-md backdrop-blur-md transition-all duration-300 bg-black/60 text-white/70 hover:bg-white hover:text-blue-500 hover:scale-110"
              title="Share"
            >
              <Share2 size={14} strokeWidth={3} />
            </button>
          </div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-neon-purple text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  HD
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {anime.status}
                </span>
                <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold ml-auto">
                  <Star size={12} fill="currentColor" />
                  {anime.rating}
                </div>
              </div>
              
              <button className="w-full bg-white text-black font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-neon-purple hover:text-white transition-colors shadow-lg hover:shadow-neon-purple/50">
                <Play size={16} fill="currentColor" />
                Watch Now
              </button>
            </div>
          </div>
          
          {/* Episode Count Badge (Top Right) - Only show if > 0 */}
          {anime.episodes > 0 && (
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2 py-1 rounded-md border border-white/10 pointer-events-none z-10">
              {anime.episodes} Ep
            </div>
          )}
        </div>
        
        <div className="mt-3">
          <h3 className="text-white font-medium truncate group-hover:text-neon-purple transition-colors">
            {anime.title}
          </h3>
          <div className="flex items-center gap-2 text-text-secondary text-xs mt-1">
            <span>{anime.year}</span>
            <span className="w-1 h-1 bg-text-secondary rounded-full"></span>
            <span>{anime.episodes > 0 ? `${anime.episodes} Eps` : 'Unknown'}</span>
            {anime.genres && anime.genres.length > 0 && (
              <>
                <span className="w-1 h-1 bg-text-secondary rounded-full"></span>
                <span className="truncate max-w-[100px]">{anime.genres[0]}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
