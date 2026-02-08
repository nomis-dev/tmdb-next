import { z } from 'zod';

const MovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string(),
  poster_path: z.string().nullable().transform((val) => val ?? ''),
  backdrop_path: z.string().nullable().transform((val) => val ?? ''),
  vote_average: z.number(),
  release_date: z.string().optional().default(''),
});

const GenreSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const CastSchema = z.object({
  id: z.number(),
  name: z.string(),
  character: z.string(),
  profile_path: z.string().nullable(),
  order: z.number(),
});

const CrewSchema = z.object({
  id: z.number(),
  name: z.string(),
  job: z.string(),
  department: z.string(),
  profile_path: z.string().nullable(),
});

const VideoSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  site: z.string(),
  type: z.string(),
  official: z.boolean(),
});

const MovieDetailsSchema = MovieSchema.extend({
  genres: z.array(GenreSchema).default([]),
  runtime: z.number().nullable().default(0),
  budget: z.number().default(0),
  revenue: z.number().default(0),
  status: z.string().default(''),
  tagline: z.string().default(''),
  credits: z.object({
    cast: z.array(CastSchema).default([]),
    crew: z.array(CrewSchema).default([]),
  }).default({ cast: [], crew: [] }),
  videos: z.object({
    results: z.array(VideoSchema).default([]),
  }).default({ results: [] }),
});

const TmdbResponseSchema = z.object({
  results: z.array(MovieSchema).default([]),
  page: z.number().default(1),
  total_pages: z.number().default(1),
  total_results: z.number().default(0),
});

export type Movie = z.infer<typeof MovieSchema>;
export type Genre = z.infer<typeof GenreSchema>;
export type Cast = z.infer<typeof CastSchema>;
export type Crew = z.infer<typeof CrewSchema>;
export type Video = z.infer<typeof VideoSchema>;
export type MovieDetails = z.infer<typeof MovieDetailsSchema>;
export type TmdbResponse = z.infer<typeof TmdbResponseSchema>;

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

const fetchAndValidate = async <T extends z.ZodTypeAny>(
  schema: T,
  url: string,
  options?: RequestInit
): Promise<z.infer<T>> => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
    
    const rawData = await res.json();
    
    const result = schema.safeParse(rawData);

    if (!result.success) {
      console.error(`[Data Corruption Detected] API Response from ${url} did not match schema:`, result.error.format());
      
      throw new Error('Data validation failed');
    }

    return result.data;

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    console.error(`Fetch failed for ${url}:`, error);
    throw error;
  }
};

export const TmdbService = {
  async fetch<T extends z.ZodTypeAny>(
    schema: T,
    endpoint: string, 
    params: Params = {}, 
    options: RequestInit = {}
  ): Promise<z.infer<T>> {
    const isServerSide = isServer() && TMDB_CONFIG.accessToken;
    const url = isServerSide
      ? buildUrl(TMDB_CONFIG.baseUrl, endpoint, params)
      : buildUrl('/api/movies', endpoint, params); // Proxied on client

    const fetchOptions = isServerSide
      ? {
          ...options,
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${TMDB_CONFIG.accessToken}`,
            ...options.headers,
          },
          next: { revalidate: 3600, ...(options as any).next },
        }
      : options;

    return fetchAndValidate(schema, url, fetchOptions);
  },

  async getPopularMovies(locale = 'en-US', page = 1): Promise<Movie[]> {
    try {
      const data = await this.fetch(TmdbResponseSchema, 'movie/popular', {
        language: locale,
        page,
      }, {
        next: { revalidate: 3600 },
        cache: 'force-cache',
      });
      return data.results;
    } catch (e) {
      console.error('Failed to get popular movies, returning empty list as fallback adapter', e);
      return [];
    }
  },

  async searchMovies(query: string, locale = 'en-US', page = 1, signal?: AbortSignal): Promise<Movie[]> {
    if (!query.trim()) return [];
    
    try {
      const data = await this.fetch(TmdbResponseSchema, 'search/movie', {
        query: query.trim(),
        language: locale,
        page,
      }, { signal });
      return data.results;
    } catch (e) {
      console.error('Failed to search movies, returning empty list fallback', e);
      return [];
    }
  },

  async getMovieDetails(movieId: number, locale = 'en-US'): Promise<MovieDetails> {
    return this.fetch(MovieDetailsSchema, `movie/${movieId}`, {
      language: locale,
      append_to_response: 'credits,videos,images',
    });
  },
};
