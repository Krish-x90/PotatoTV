import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Anime, Episode } from '../types';

interface HistoryItem {
  animeId: string;
  episodeId: string;
  title: string;
  poster: string;
  totalEpisodes: number;
  type: 'tv' | 'movie';
  timestamp: number; // progress in seconds
  lastWatched: number; // Date.now()
}

interface UserStoreState {
  watchlist: string[]; // List of anime IDs
  favorites: string[]; // List of anime IDs
  history: HistoryItem[];
  addToWatchlist: (animeId: string) => void;
  removeFromWatchlist: (animeId: string) => void;
  isInWatchlist: (animeId: string) => boolean;
  addToFavorites: (animeId: string) => void;
  removeFromFavorites: (animeId: string) => void;
  isFavorite: (animeId: string) => boolean;
  updateHistory: (animeId: string, episodeId: string, timestamp: number, details?: { title: string; poster: string; totalEpisodes: number; type: 'tv' | 'movie' }) => void;
  getHistoryForAnime: (animeId: string) => HistoryItem | undefined;
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      favorites: [],
      history: [],
      addToWatchlist: (animeId) => set((state) => ({ 
        watchlist: state.watchlist.includes(animeId) ? state.watchlist : [...state.watchlist, animeId] 
      })),
      removeFromWatchlist: (animeId) => set((state) => ({ 
        watchlist: state.watchlist.filter((id) => id !== animeId) 
      })),
      isInWatchlist: (animeId) => get().watchlist.includes(animeId),
      addToFavorites: (animeId) => set((state) => ({ 
        favorites: state.favorites.includes(animeId) ? state.favorites : [...state.favorites, animeId] 
      })),
      removeFromFavorites: (animeId) => set((state) => ({ 
        favorites: state.favorites.filter((id) => id !== animeId) 
      })),
      isFavorite: (animeId) => get().favorites.includes(animeId),
      updateHistory: (animeId, episodeId, timestamp, details) => set((state) => {
        const existingIndex = state.history.findIndex(h => h.animeId === animeId);
        const existingItem = state.history[existingIndex];
        
        const newItem: HistoryItem = { 
          animeId, 
          episodeId, 
          timestamp, 
          lastWatched: Date.now(),
          title: details?.title || existingItem?.title || 'Unknown',
          poster: details?.poster || existingItem?.poster || '',
          totalEpisodes: details?.totalEpisodes || existingItem?.totalEpisodes || 0,
          type: details?.type || existingItem?.type || 'tv'
        };
        
        if (existingIndex >= 0) {
          const newHistory = [...state.history];
          newHistory[existingIndex] = newItem;
          return { history: newHistory };
        }
        
        return { history: [newItem, ...state.history] };
      }),
      getHistoryForAnime: (animeId) => get().history.find(h => h.animeId === animeId),
    }),
    {
      name: 'user-data-storage',
    }
  )
);
