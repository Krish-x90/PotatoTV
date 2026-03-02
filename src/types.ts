export interface Anime {
  id: string;
  title: string;
  poster: string;
  banner: string;
  rating: number;
  description: string;
  genres: string[];
  episodes: number;
  status: 'Ongoing' | 'Completed' | 'Unknown';
  year: number;
  studio: string;
  trailer?: string;
}

export interface Episode {
  id: string;
  animeId: string;
  number: number;
  title: string;
  thumbnail: string;
  duration: string;
  videoUrl?: string;
}
