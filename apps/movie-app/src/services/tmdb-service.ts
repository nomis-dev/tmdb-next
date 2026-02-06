export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
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
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
  return res.json();
};

export const TmdbService = {
  async fetch<T>(endpoint: string, params: Params = {}): Promise<T> {
    if (isServer() && TMDB_CONFIG.accessToken) {
      return fetchJson<T>(
        buildUrl(TMDB_CONFIG.baseUrl, endpoint, params),
        {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${TMDB_CONFIG.accessToken}`,
          },
          next: { revalidate: 3600 },
        }
      );
    }

    return fetchJson<T>(buildUrl('/api/movies', endpoint, params));
  },

  async getPopularMovies(locale = 'en-US', page = 1): Promise<Movie[]> {
    const data = await this.fetch<TmdbResponse<Movie>>('movie/popular', {
      language: locale,
      page,
    });
    return data.results;
  },
};
