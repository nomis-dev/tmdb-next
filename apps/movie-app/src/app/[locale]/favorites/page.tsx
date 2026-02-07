'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import MovieCard from '@/components/MovieCard';
import { LoadingSpinner } from '@tmdb/ui';
import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface Favorite {
  movieId: number;
  title: string;
  posterPath: string;
  rating: number;
  createdAt: string;
  mediaType: string;
}

type SortOption = 'date_desc' | 'date_asc' | 'rating_desc' | 'rating_asc';

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');

  const { data: favorites = [], isLoading: queryLoading } = useQuery<Favorite[]>({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch('/api/favorites');
      if (!res.ok) throw new Error('Failed to fetch favorites');
      return res.json();
    },
    enabled: !!user,
  });

  const sortedFavorites = [...favorites].sort((a, b) => {
    switch (sortBy) {
      case 'date_desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'date_asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'rating_desc':
        return (b.rating || 0) - (a.rating || 0);
      case 'rating_asc':
        return (a.rating || 0) - (b.rating || 0);
      default:
        return 0;
    }
  });

  if (authLoading || (queryLoading && user)) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
        <h1 className="text-2xl font-bold mb-4 text-white">Please sign in to view favorites</h1>
        <p className="text-slate-400 mb-8">Access your curated list of movies by logging in.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20 md:mt-16">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white">My Favorites</h1>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400 mr-1">Sort by:</span>
          
          <button
            onClick={() => {
              if (sortBy.startsWith('date')) {
                setSortBy(sortBy === 'date_desc' ? 'date_asc' : 'date_desc');
              } else {
                setSortBy('date_desc');
              }
            }}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 border ${
              sortBy.startsWith('date')
                ? 'bg-white text-black border-white'
                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            Date
            {sortBy.startsWith('date') && (
              sortBy === 'date_desc' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => {
              if (sortBy.startsWith('rating')) {
                setSortBy(sortBy === 'rating_desc' ? 'rating_asc' : 'rating_desc');
              } else {
                setSortBy('rating_desc');
              }
            }}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 border ${
              sortBy.startsWith('rating')
                ? 'bg-white text-black border-white'
                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            Rating
            {sortBy.startsWith('rating') && (
              sortBy === 'rating_desc' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-white/5">
          <svg
            className="mx-auto h-16 w-16 text-slate-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">No favorites yet</h3>
          <p className="text-slate-400 mb-6">Start exploring movies and add them to your list!</p>
          <Link 
            href="/"
            className="inline-block px-6 py-2 rounded-full bg-accent hover:bg-accent/90 text-white font-medium transition-colors"
          >
            Explore Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {sortedFavorites.map((movie) => (
            <MovieCard
              key={movie.movieId}
              id={movie.movieId}
              title={movie.title}
              posterPath={movie.posterPath}
              rating={movie.rating}
              isFavorite={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
