import React, { useEffect, useState } from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { AnimeCard } from '../components/ui/AnimeCard';
import { ChevronRight, Loader2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { Anime } from '../types';
import { getTrendingAnime, getPopularAnime, getRecentAnime } from '../services/tmdb';
import { useUserStore } from '../store/useUserStore';

export const Home = () => {
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [popularAnime, setPopularAnime] = useState<Anime[]>([]);
  const [recentAnime, setRecentAnime] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { history } = useUserStore();

  const recentlyViewed = React.useMemo(() => {
    const uniqueAnime = new Map();
    history.forEach(item => {
      if (!uniqueAnime.has(item.animeId)) {
        uniqueAnime.set(item.animeId, {
          id: item.animeId,
          title: item.title,
          poster: item.poster,
          banner: item.poster, // Fallback as we might not have banner in history
          rating: 0, // Not stored in history
          description: '',
          genres: [],
          episodes: item.totalEpisodes,
          status: 'Unknown',
          year: new Date(item.lastWatched).getFullYear(),
          studio: 'Unknown'
        } as Anime);
      }
    });
    return Array.from(uniqueAnime.values()).slice(0, 5);
  }, [history]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingData, popularData, recentData] = await Promise.all([
          getTrendingAnime(),
          getPopularAnime(),
          getRecentAnime()
        ]);

        setTrendingAnime(trendingData);
        setPopularAnime(popularData);
        setRecentAnime(recentData);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-neon-purple" size={48} />
      </div>
    );
  }

  return (
    <div className="pb-20">
      <SEO title="Home" />
      <HeroCarousel featuredAnime={trendingAnime.length > 0 ? trendingAnime : []} />

      <div className="container mx-auto px-4 mt-12 space-y-16">
        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-8 bg-neon-purple rounded-full block"></span>
                Recently Viewed
              </h2>
              <Link to="/profile" className="text-text-secondary hover:text-neon-purple flex items-center gap-1 text-sm transition-colors">
                View History <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {recentlyViewed.map((anime, idx) => (
                <AnimeCard key={anime.id} anime={anime} index={idx} />
              ))}
            </div>
          </section>
        )}

        {/* Trending Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-8 bg-neon-purple rounded-full block"></span>
              Trending Now
            </h2>
            <Link to="/search?q=One Piece" className="text-text-secondary hover:text-neon-purple flex items-center gap-1 text-sm transition-colors">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {trendingAnime.map((anime, idx) => (
              <AnimeCard key={anime.id} anime={anime} index={idx} />
            ))}
          </div>
        </section>

        {/* Popular Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-8 bg-neon-purple rounded-full block"></span>
              Popular This Week
            </h2>
            <Link to="/search?q=Naruto" className="text-text-secondary hover:text-neon-purple flex items-center gap-1 text-sm transition-colors">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {popularAnime.map((anime, idx) => (
              <AnimeCard key={anime.id} anime={anime} index={idx} />
            ))}
          </div>
        </section>

        {/* Recently Added Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-8 bg-neon-purple rounded-full block"></span>
              Recently Added
            </h2>
            <Link to="/search?q=Boruto" className="text-text-secondary hover:text-neon-purple flex items-center gap-1 text-sm transition-colors">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {recentAnime.map((anime, idx) => (
              <AnimeCard key={anime.id} anime={anime} index={idx} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
