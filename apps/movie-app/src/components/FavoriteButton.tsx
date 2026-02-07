'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface FavoriteButtonProps {
  movieId: number;
  title: string;
  posterPath: string | null;
  rating: number;
  className?: string;
  isFavorite: boolean;
}

interface Favorite {
  movieId: number;
}

export default function FavoriteButton({
  movieId,
  title,
  posterPath,
  rating,
  className = '',
  isFavorite,
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [optimisticFavorite, setOptimisticFavorite] = useState(isFavorite);

  useEffect(() => {
    setOptimisticFavorite(isFavorite);
  }, [isFavorite]);

  const { mutate: toggleFavorite, isPending } = useMutation({
    mutationFn: async () => {
      if (!user) return;
      if (isFavorite) {
        await fetch(`/api/favorites?movieId=${movieId}`, { method: 'DELETE' });
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ movieId, title, posterPath, rating }),
        });
      }
    },
    onMutate: async () => {
      if (!user) return;
      await queryClient.cancelQueries({ queryKey: ['favorites', user.id] });

      const previousFavorites = queryClient.getQueryData<Favorite[]>(['favorites', user.id]);

      if (previousFavorites) {
        queryClient.setQueryData<Favorite[]>(['favorites', user.id], (old) => {
          if (!old) return [];
          if (isFavorite) {
            return old.filter((f) => f.movieId !== movieId);
          } else {
            return [...old, { movieId }];
          }
        });
      }

      return { previousFavorites };
    },
    onError: (err, newTodo, context) => {
      if (!user) return;
      setOptimisticFavorite(isFavorite);
      
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites', user.id], context.previousFavorites);
      }
      console.error('Failed to toggle favorite:', err);
    },
    onSettled: () => {
      if (!user) return;
      queryClient.invalidateQueries({ queryKey: ['favorites', user.id] });
    },
  });

  if (!user) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOptimisticFavorite(!optimisticFavorite); // Instant UI update
    toggleFavorite();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`p-2 rounded-full transition-all duration-200 ${
        optimisticFavorite
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-white/10 text-white hover:bg-white/20'
      } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      title={optimisticFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className="w-5 h-5"
        fill={optimisticFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
