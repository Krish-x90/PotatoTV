import { Anime, Episode } from '../types';

// TMDB API Configuration — rotating key pool
const TMDB_API_KEYS = [
    'fb7bb23f03b6994dafc674c074d01761',
    'e55425032d3d0f371fc776f302e7c09b',
    '8301a21598f8b45668d5711a814f01f6',
    '8cf43ad9c085135b9479ad5cf6bbcbda',
    'da63548086e399ffc910fbc08526df05',
    '13e53ff644a8bd4ba37b3e1044ad24f3',
    '269890f657dddf4635473cf4cf456576',
    'a2f888b27315e62e471b2d587048f32e',
    '8476a7ab80ad76f0936744df0430e67c',
    '5622cafbfe8f8cfe358a29c53e19bba0',
    '257654f35e3dff105574f97fb4b97035',
    '2f4038e83265214a0dcd6ec2eb3276f5',
    '9e43f45f94705cc8e1d5a0400d19a7b7',
    'af6887753365e14160254ac7f4345dd2',
    '06f10fc8741a672af455421c239a1ffc',
    '09ad8ace66eec34302943272db0e8d2c',
];

let _keyIndex = 0;
function getKey() { return TMDB_API_KEYS[_keyIndex]; }

export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
export const TMDB_IMAGE_ORIGINAL = 'https://image.tmdb.org/t/p/original';

async function tmdbFetch(endpoint: string) {
    for (let attempt = 0; attempt < TMDB_API_KEYS.length; attempt++) {
        const key = getKey();
        // Replace or append api_key param
        const url = `${TMDB_BASE_URL}${endpoint}`.replace(/api_key=[^&]+/, `api_key=${key}`);
        const res = await fetch(url);
        if (res.ok) return res.json();
        if (res.status === 401 || res.status === 429) {
            // Rotate to next key and retry
            _keyIndex = (_keyIndex + 1) % TMDB_API_KEYS.length;
            console.warn(`Key ${attempt + 1} failed (${res.status}), trying next key…`);
            continue;
        }
        throw new Error(`TMDB fetch failed: ${res.status}`);
    }
    throw new Error('All TMDB API keys exhausted.');
}

// ─── Mappers ────────────────────────────────────────────────────────────────

const mapTmdbToAnime = (item: any, type: 'tv' | 'movie'): Anime => {
  return {
    id: `${type}_${item.id}`,
    title: item.name || item.title || item.original_name || item.original_title,
    poster: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : 'https://picsum.photos/300/450',
    banner: item.backdrop_path ? `${TMDB_IMAGE_ORIGINAL}${item.backdrop_path}` : 'https://picsum.photos/1920/1080',
    rating: item.vote_average || 0,
    description: item.overview || 'No description available.',
    genres: item.genres ? item.genres.map((g: any) => g.name) : [],
    episodes: item.number_of_episodes || (type === 'movie' ? 1 : 0),
    status: item.status === 'Ended' || item.status === 'Released' ? 'Completed' : 'Ongoing',
    year: new Date(item.first_air_date || item.release_date || Date.now()).getFullYear(),
    studio: item.production_companies?.[0]?.name || 'Unknown',
    trailer: undefined // Need to fetch videos separately if needed
  };
};

// ─── TV Shows ────────────────────────────────────────────────────────────────

export function getLatestAnime(page = 1) {
    return tmdbFetch(
        `/discover/tv?api_key=${getKey()}&sort_by=first_air_date.desc&with_genres=16&with_original_language=ja&language=en-US&with_keywords=237451&page=${page}`
    );
}

export function getLatestAnimeTV(page = 1) {
    const today = new Date().toISOString().split('T')[0];
    return tmdbFetch(
        `/discover/tv?api_key=${getKey()}&sort_by=first_air_date.desc&with_genres=16&with_original_language=ja&language=en-US&page=${page}&air_date.lte=${today}`
    );
}

export function getTVDetails(tvId: string | number) {
    return tmdbFetch(`/tv/${tvId}?api_key=${getKey()}`);
}

export function getTVSeason(tvId: string | number, seasonNumber: number) {
    return tmdbFetch(`/tv/${tvId}/season/${seasonNumber}?api_key=${getKey()}`);
}

export function getTVCredits(tvId: string | number) {
    return tmdbFetch(`/tv/${tvId}/credits?api_key=${getKey()}`);
}

export function searchTvShow(query: string) {
    return tmdbFetch(
        `/search/tv?api_key=${getKey()}&with_genres=16&query=${encodeURIComponent(query)}`
    );
}

// ─── Movies ──────────────────────────────────────────────────────────────────

export function getPopularAnimeMovies(page = 1) {
    return tmdbFetch(
        `/discover/movie?api_key=${getKey()}&page=${page}&with_genres=16&sort_by=popularity.desc&with_original_language=ja`
    );
}

export function getNowPlayingMovies(page = 1) {
    return tmdbFetch(
        `/discover/movie?api_key=${getKey()}&page=${page}&with_genres=16&with_original_language=ja&sort_by=popularity.desc&with_release_type=2|3`
    );
}

export function getAnimeMovies(page = 1) {
    return tmdbFetch(
        `/discover/movie?api_key=${getKey()}&page=${page}&with_genres=16&with_original_language=ja&sort_by=release_date.desc`
    );
}

export function getMovieDetails(movieId: string | number) {
    return tmdbFetch(`/movie/${movieId}?api_key=${getKey()}`);
}

export function getMovieCredits(movieId: string | number) {
    return tmdbFetch(`/movie/${movieId}/credits?api_key=${getKey()}`);
}

export function searchMovies(query: string) {
    return tmdbFetch(
        `/search/movie?api_key=${getKey()}&query=${encodeURIComponent(query)}&with_genres=16`
    );
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const TMDB_GENRES: Record<string, number> = {
  'Action': 28,
  'Adventure': 12,
  'Animation': 16,
  'Comedy': 35,
  'Crime': 80,
  'Documentary': 99,
  'Drama': 18,
  'Family': 10751,
  'Fantasy': 14,
  'History': 36,
  'Horror': 27,
  'Music': 10402,
  'Mystery': 9648,
  'Romance': 10749,
  'Sci-Fi': 878,
  'TV Movie': 10770,
  'Thriller': 53,
  'War': 10752,
  'Western': 37,
};

// ─── Unified Service Methods ─────────────────────────────────────────────────

export const getTrendingAnime = async (): Promise<Anime[]> => {
  const data = await getLatestAnimeTV(1);
  return data.results.map((item: any) => mapTmdbToAnime(item, 'tv'));
};

export const getPopularAnime = async (): Promise<Anime[]> => {
  const data = await getPopularAnimeMovies(1);
  return data.results.map((item: any) => mapTmdbToAnime(item, 'movie'));
};

export const getRecentAnime = async (): Promise<Anime[]> => {
  const data = await getNowPlayingMovies(1);
  return data.results.map((item: any) => mapTmdbToAnime(item, 'movie'));
};

export const getAnimeByGenre = async (genre: string): Promise<Anime[]> => {
  const genreId = TMDB_GENRES[genre];
  if (!genreId) return getTrendingAnime();

  // Fetch both TV and Movies for this genre
  const [tv, movies] = await Promise.all([
    tmdbFetch(`/discover/tv?api_key=${getKey()}&with_genres=16,${genreId}&with_original_language=ja&sort_by=popularity.desc`),
    tmdbFetch(`/discover/movie?api_key=${getKey()}&with_genres=16,${genreId}&with_original_language=ja&sort_by=popularity.desc`)
  ]);

  const tvResults = tv.results.map((item: any) => mapTmdbToAnime(item, 'tv'));
  const movieResults = movies.results.map((item: any) => mapTmdbToAnime(item, 'movie'));
  
  // Interleave results for variety
  const combined = [];
  const maxLength = Math.max(tvResults.length, movieResults.length);
  for (let i = 0; i < maxLength; i++) {
    if (tvResults[i]) combined.push(tvResults[i]);
    if (movieResults[i]) combined.push(movieResults[i]);
  }
  
  return combined;
};

export const getAnimeByRating = async (): Promise<Anime[]> => {
  const data = await tmdbFetch(
    `/discover/tv?api_key=${getKey()}&with_genres=16&with_original_language=ja&sort_by=vote_average.desc&vote_count.gte=100`
  );
  return data.results.map((item: any) => mapTmdbToAnime(item, 'tv'));
};

export const searchAnime = async (query: string): Promise<Anime[]> => {
  const [tv, movies] = await Promise.all([
    searchTvShow(query),
    searchMovies(query)
  ]);
  
  const tvResults = tv.results.map((item: any) => mapTmdbToAnime(item, 'tv'));
  const movieResults = movies.results.map((item: any) => mapTmdbToAnime(item, 'movie'));
  
  return [...tvResults, ...movieResults];
};

export const getAnimeDetails = async (id: string): Promise<Anime | null> => {
  const [type, tmdbId] = id.split('_');
  if (!tmdbId) return null;

  try {
    if (type === 'tv') {
      const data = await getTVDetails(tmdbId);
      return mapTmdbToAnime(data, 'tv');
    } else {
      const data = await getMovieDetails(tmdbId);
      return mapTmdbToAnime(data, 'movie');
    }
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getAnimeEpisodes = async (id: string): Promise<Episode[]> => {
  const [type, tmdbId] = id.split('_');
  if (!tmdbId) return [];

  try {
    if (type === 'tv') {
      // Fetch details to get season count
      const details = await getTVDetails(tmdbId);
      const seasons = details.seasons || [];
      
      // For simplicity, just fetch Season 1 (or the first non-zero season)
      // A better approach would be to fetch all seasons, but that's many requests.
      // Let's fetch Season 1.
      const season1 = seasons.find((s: any) => s.season_number === 1) || seasons[0];
      if (!season1) return [];

      const seasonData = await getTVSeason(tmdbId, season1.season_number);
      
      return seasonData.episodes.map((ep: any) => ({
        id: `${id}_s${season1.season_number}_e${ep.episode_number}`,
        animeId: id,
        number: ep.episode_number,
        title: ep.name,
        thumbnail: ep.still_path ? `${TMDB_IMAGE_BASE}${ep.still_path}` : '',
        duration: ep.runtime ? `${ep.runtime} min` : '24 min',
        videoUrl: '' // No video URL from TMDB
      }));
    } else {
      // Movie
      const details = await getMovieDetails(tmdbId);
      return [{
        id: `${id}_movie`,
        animeId: id,
        number: 1,
        title: details.title,
        thumbnail: details.backdrop_path ? `${TMDB_IMAGE_BASE}${details.backdrop_path}` : '',
        duration: details.runtime ? `${details.runtime} min` : 'Unknown',
        videoUrl: ''
      }];
    }
  } catch (e) {
    console.error(e);
    return [];
  }
};
