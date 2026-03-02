import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Clock, Heart, LogOut, Camera } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AnimeCard } from '../components/ui/AnimeCard';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStore } from '../store/useUserStore';
import { SEO } from '../components/SEO';
import { getAnimeDetails } from '../services/tmdb';
import { Anime } from '../types';

export const Profile = () => {
  const { user, isAuthenticated, logout, updateAvatar } = useAuthStore();
  const { watchlist, history } = useUserStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'watchlist' | 'history'>('watchlist');
  
  const [watchlistAnime, setWatchlistAnime] = useState<Anime[]>([]);
  const [historyAnime, setHistoryAnime] = useState<(Anime & { animeId: string; episodeId: string; timestamp: number; lastWatched: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadProfileData = async () => {
      setLoading(true);
      try {
        // Fetch Watchlist
        const watchlistPromises = watchlist.map(id => getAnimeDetails(id).catch(() => null));
        const watchlistResults = await Promise.all(watchlistPromises);
        setWatchlistAnime(watchlistResults.filter((a): a is Anime => a !== null));

        // Fetch History
        // We need to fetch anime details for each history item
        // Deduplicate anime IDs to avoid redundant requests
        const uniqueHistoryAnimeIds = Array.from(new Set(history.map(h => h.animeId)));
        const historyAnimePromises = uniqueHistoryAnimeIds.map(id => getAnimeDetails(id).catch(() => null));
        const historyAnimeResults = await Promise.all(historyAnimePromises);
        
        const historyAnimeMap = new Map(historyAnimeResults.filter((a): a is Anime => a !== null).map(a => [a.id, a]));

        const combinedHistory = history.map(h => {
          const anime = historyAnimeMap.get(h.animeId);
          return anime ? { ...anime, ...h } : null;
        })
        .filter((item): item is (Anime & { animeId: string; episodeId: string; timestamp: number; lastWatched: number }) => item !== null)
        .sort((a, b) => b.lastWatched - a.lastWatched);

        setHistoryAnime(combinedHistory);

      } catch (error) {
        console.error("Failed to load profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [isAuthenticated, navigate, watchlist, history]);

  if (!user) return null;

  const handleAvatarChange = () => {
    const seeds = ['Felix', 'Aneka', 'Willow', 'Bandit', 'Milo'];
    const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];
    updateAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <SEO title="My Profile" />
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full md:w-80 flex-shrink-0">
          <div className="bg-secondary-dark border border-white/5 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-neon-purple/20 to-transparent"></div>
            
            <div className="relative inline-block mb-4">
              <img 
                src={user.avatar} 
                alt={user.username} 
                className="w-32 h-32 rounded-full border-4 border-secondary-dark shadow-[0_0_20px_rgba(160,32,240,0.3)]"
              />
              <button 
                onClick={handleAvatarChange}
                className="absolute bottom-0 right-0 p-2 bg-neon-purple rounded-full text-white hover:bg-neon-purple/80 transition-colors shadow-lg"
                title="Change Avatar"
              >
                <Camera size={16} />
              </button>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-1">{user.username}</h2>
            <p className="text-text-secondary text-sm mb-6">{user.email}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-background/50 p-3 rounded-xl border border-white/5">
                <div className="text-2xl font-bold text-neon-purple">{watchlist.length}</div>
                <div className="text-xs text-text-secondary uppercase font-bold">Watchlist</div>
              </div>
              <div className="bg-background/50 p-3 rounded-xl border border-white/5">
                <div className="text-2xl font-bold text-green-400">{history.length}</div>
                <div className="text-xs text-text-secondary uppercase font-bold">Watched</div>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Continue Watching Section */}
          {!loading && historyAnime.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Play size={24} className="text-neon-purple" fill="currentColor" />
                Continue Watching
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {historyAnime.slice(0, 2).map((item) => (
                  <Link 
                    key={`continue-${item.id}`}
                    to={`/watch/${item.id}?ep=${item.episodeId.split('_e')[1] || item.episodeId.split('-ep-')[1]}`}
                    className="flex gap-4 bg-secondary-dark border border-white/5 hover:border-neon-purple/50 rounded-xl p-4 transition-all group hover:shadow-[0_0_20px_rgba(160,32,240,0.15)] hover:bg-white/5"
                  >
                    <div className="relative w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                      <img src={item.poster} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={32} fill="white" className="text-white drop-shadow-lg" />
                      </div>
                    </div>
                    <div className="flex flex-col justify-center flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-neon-purple transition-colors">{item.title}</h3>
                      <p className="text-sm text-text-secondary mb-4">
                        Episode {item.episodeId.split('_e')[1] || item.episodeId.split('-ep-')[1]}
                      </p>
                      
                      <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full bg-gradient-to-r from-neon-purple to-purple-400 shadow-[0_0_10px_#A020F0]" 
                          style={{ width: `${Math.min((item.timestamp / 1440) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-text-secondary">
                        <span>{Math.floor(item.timestamp / 60)}m watched</span>
                        <span>24m total</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-1">
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`pb-3 text-lg font-medium transition-colors relative ${
                activeTab === 'watchlist' ? 'text-white' : 'text-text-secondary hover:text-white'
              }`}
            >
              <Heart size={18} className="inline mr-2" />
              Watchlist
              {activeTab === 'watchlist' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-purple" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 text-lg font-medium transition-colors relative ${
                activeTab === 'history' ? 'text-white' : 'text-text-secondary hover:text-white'
              }`}
            >
              <Clock size={18} className="inline mr-2" />
              History
              {activeTab === 'history' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-purple" />
              )}
            </button>
          </div>

          {loading ? (
             <div className="flex items-center justify-center py-20">
               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-purple"></div>
             </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'watchlist' ? (
                watchlistAnime.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {watchlistAnime.map((anime, idx) => (
                      <AnimeCard key={anime.id} anime={anime} index={idx} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-text-secondary bg-secondary-dark/30 rounded-2xl border border-white/5">
                    <Heart size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Your watchlist is empty.</p>
                    <Link to="/search" className="text-neon-purple hover:underline mt-2 inline-block">
                      Browse Anime
                    </Link>
                  </div>
                )
              ) : (
                historyAnime.length > 0 ? (
                  <div className="space-y-4">
                    {historyAnime.map((item) => (
                      <Link 
                        key={`${item.id}-${item.episodeId}`} 
                        to={`/watch/${item.id}?ep=${item.episodeId.split('_e')[1] || item.episodeId.split('-ep-')[1]}`}
                        className="flex items-center gap-4 bg-secondary-dark/50 hover:bg-secondary-dark border border-white/5 hover:border-neon-purple/30 p-4 rounded-xl transition-all group"
                      >
                        <img src={item.poster} alt={item.title} className="w-16 h-24 object-cover rounded-md shadow-md" />
                        <div className="flex-1">
                          <h3 className="text-white font-bold group-hover:text-neon-purple transition-colors">{item.title}</h3>
                          <p className="text-sm text-text-secondary mb-2">
                            Episode {item.episodeId.split('_e')[1] || item.episodeId.split('-ep-')[1]}
                          </p>
                          <div className="w-full max-w-xs bg-black/50 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-neon-purple" 
                              style={{ width: `${Math.min((item.timestamp / 1440) * 100, 100)}%` }} // Mock duration 24m = 1440s
                            />
                          </div>
                          <p className="text-xs text-text-secondary mt-1">
                            {Math.floor(item.timestamp / 60)}m watched
                          </p>
                        </div>
                        <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          Continue
                        </Button>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-text-secondary bg-secondary-dark/30 rounded-2xl border border-white/5">
                    <Clock size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No watch history yet.</p>
                    <Link to="/" className="text-neon-purple hover:underline mt-2 inline-block">
                      Start Watching
                    </Link>
                  </div>
                )
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
