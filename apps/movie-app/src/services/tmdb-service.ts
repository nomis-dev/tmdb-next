export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  budget: number;
  revenue: number;
  status: string;
  tagline: string;
  credits: {
    cast: Cast[];
    crew: Crew[];
  };
  videos: {
    results: Video[];
  };
}

interface TmdbResponse<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}

const TMDB_CONFIG = {
  baseUrl: 'https://api.themoviedb.org/3',
  accessToken: process.env.TMDB_ACCESS_TOKEN,
} as const;

type Params = Record<string, string | number>;

const isServer = () => typeof window === 'undefined';

const buildUrl = (base: string, endpoint: string, params: Params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return query ? `${base}/${endpoint}?${query}` : `${base}/${endpoint}`;
};

const fetchJson = async <T>(url: string, options?: RequestInit): Promise<T> => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (error) {
    // Re-throw AbortError to handle request cancellation correctly
    if (error instanceof Error && error.name === 'AbortError') throw error;
    
    console.error(`Fetch failed for ${url}:`, error);
    throw new Error(`Failed to fetch data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const TmdbService = {
  async fetch<T>(endpoint: string, params: Params = {}, options: RequestInit = {}): Promise<T> {
    if (isServer() && TMDB_CONFIG.accessToken) {
      return fetchJson<T>(
        buildUrl(TMDB_CONFIG.baseUrl, endpoint, params),
        {
          ...options,
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${TMDB_CONFIG.accessToken}`,
            ...options.headers,
          },
          next: { revalidate: 3600, ...options.next },
        }
      );
    }

    return fetchJson<T>(buildUrl('/api/movies', endpoint, params), options);
  },

  async getPopularMovies(locale = 'en-US', page = 1): Promise<Movie[]> {
    const data = await this.fetch<TmdbResponse<Movie>>('movie/popular', {
      language: locale,
      page,
    });
    return data.results;
  },

  async searchMovies(query: string, locale = 'en-US', page = 1, signal?: AbortSignal): Promise<Movie[]> {
    if (!query.trim()) return [];
    
    const data = await this.fetch<TmdbResponse<Movie>>('search/movie', {
      query: query.trim(),
      language: locale,
      page,
    }, { signal });
    return data.results;
  },

  async getMovieDetails(movieId: number, locale = 'en-US'): Promise<MovieDetails> {
    return this.fetch<MovieDetails>(`movie/${movieId}`, {
      language: locale,
      append_to_response: 'credits,videos,images',
    });
  },
};
