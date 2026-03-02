import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search as SearchIcon, Loader2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { AnimeCard } from '../components/ui/AnimeCard';
import { SEO } from '../components/SEO';
import { Anime } from '../types';
import { searchAnime, getPopularAnime, getTrendingAnime, getAnimeByGenre, getAnimeByRating, TMDB_GENRES } from '../services/tmdb';

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';
  const sort = searchParams.get('sort') || '';

  const [results, setResults] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [localQuery, setLocalQuery] = useState(query);
  const [error, setError] = useState('');

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  useEffect(() => {
    const fetchAnime = async () => {
      setIsLoading(true);
      setError('');

      try {
        let data: Anime[] = [];

        if (query) {
          data = await searchAnime(query);
        } else if (sort === 'popular') {
          data = await getPopularAnime();
        } else if (sort === 'rating') {
          data = await getAnimeByRating();
        } else if (genre) {
          data = await getAnimeByGenre(genre);
        } else {
          // Default: show trending if nothing selected
          data = await getTrendingAnime();
        }

        setResults(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch anime. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search only if query is present and changing
    if (query) {
      const timeoutId = setTimeout(() => {
        fetchAnime();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      fetchAnime();
    }
  }, [query, sort, genre]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Clear sort/genre when searching manually
    setSearchParams({ q: localQuery });
  };

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
      // If setting genre/sort, clear query to avoid confusion
      newParams.delete('q');
      setLocalQuery('');
    } else {
      newParams.delete(key);
    }
    
    // If setting one filter, clear the others to avoid conflicts in this simple implementation
    if (key === 'genre') newParams.delete('sort');
    if (key === 'sort') newParams.delete('genre');

    setSearchParams(newParams);
  };

  return (
    <div className="container mx-auto px-4 pb-20 pt-8">
      <SEO title={`Search: ${query || genre || sort || 'Anime'}`} description="Search for your favorite anime." />
      
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="bg-secondary-dark border border-white/5 rounded-xl p-4 sticky top-24">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Filter size={18} className="text-neon-purple" /> Filters
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Sort By</label>
                <div className="space-y-2">
                  {[
                    { label: 'Trending', value: '' },
                    { label: 'Popularity', value: 'popular' },
                    { label: 'Top Rated', value: 'rating' },
                  ].map((option) => (
                    <button
                      key={option.label}
                      onClick={() => handleFilterChange('sort', option.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                        (sort === option.value && !genre && !query) || (!sort && !genre && !query && option.value === '')
                          ? 'bg-neon-purple text-white shadow-[0_0_15px_rgba(160,32,240,0.5)]'
                          : 'text-text-secondary hover:bg-white/10 hover:text-white hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Genres</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(TMDB_GENRES).map((g) => (
                    <button
                      key={g}
                      onClick={() => handleFilterChange('genre', g)}
                      className={`px-3 py-1 rounded-full text-xs border transition-all duration-300 ${
                        genre === g
                          ? 'bg-neon-purple border-neon-purple text-white shadow-[0_0_15px_rgba(160,32,240,0.5)]'
                          : 'bg-transparent border-white/10 text-text-secondary hover:border-neon-purple/50 hover:text-white hover:shadow-[0_0_10px_rgba(160,32,240,0.2)]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          <form onSubmit={handleSearch} className="mb-6">
            <Input
              placeholder="Search anime..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              leftIcon={<SearchIcon size={18} />}
              className="bg-secondary-dark border-white/5"
            />
          </form>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-neon-purple" size={48} />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-text-secondary text-sm">
                Found <span className="text-white font-bold">{results.length}</span> results
              </div>

              {results.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {results.map((anime, idx) => (
                    <AnimeCard key={anime.id} anime={anime} index={idx} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
                  <SearchIcon size={48} className="mb-4 opacity-20" />
                  <p>No results found for "{query}".</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
