'use client';

import { useCallback, memo, useOptimistic, startTransition } from 'react';
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

// ==========================================
// OPTIMISTIC FAVORITE BUTTON (React 19 + TanStack Query)
// ==========================================
// This component renders the heart icon on movie cards.
// It uses cutting-edge React 19 features to provide a "zero-latency" feel.
// When a user clicks the button, the UI updates instantly, while the actual
// database request happens silently in the background.
function FavoriteButton({
  movieId,
  title,
  posterPath,
  rating,
  className = '',
  isFavorite,
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // 1. React 19 `useOptimistic` Hook
  // This allows us to temporarily override the true `isFavorite` state from the server
  // with an "optimistic" localized state while a network request is pending.
  // If the component re-renders from the server data, `optimisticFavorite` resets to `isFavorite`.
  const [optimisticFavorite, addOptimisticFavorite] = useOptimistic<boolean, boolean>(
    isFavorite,
    (state, newFavorite) => newFavorite
  );

  // 2. The Network Mutation (TanStack Query)
  const { mutateAsync: toggleFavoriteAsync, isPending } = useMutation({
    // The actual API call to add or remove the favorite in Supabase
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
    // Fired BEFORE the mutationFn runs
    onMutate: async () => {
      if (!user) return;
      
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update magically)
      await queryClient.cancelQueries({ queryKey: ['favorites', user.id] });

      // Snapshot the previous value of the user's favorites list from the cache
      const previousFavorites = queryClient.getQueryData<Favorite[]>(['favorites', user.id]);

      // Optimistically update the GLOBAL cache. 
      // This is crucial because it ensures any OTHER component looking at the favorites
      // cache also sees this instant update.
      if (previousFavorites) {
        queryClient.setQueryData<Favorite[]>(['favorites', user.id], (old) => {
          if (!old) return [];
          if (isFavorite) {
            return old.filter((f) => f.movieId !== movieId); // Remove
          } else {
            return [...old, { movieId }]; // Add
          }
        });
      }

      // Return the snapshot so we have it in case the network request fails
      return { previousFavorites };
    },
    // Fired if the API request failed (e.g., user went offline)
    onError: (err, newTodo, context) => {
      if (!user) return;
      
      // Oh no, the request failed! Roll back the global cache to the snapshot we saved.
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites', user.id], context.previousFavorites);
      }
      console.error('Failed to toggle favorite:', err);
    },
    // Fired after either success OR error
    onSettled: () => {
      if (!user) return;
      // Force a background refetch from the database to guarantee total sync
      queryClient.invalidateQueries({ queryKey: ['favorites', user.id] });
    },
  });

  // 3. The Click Handler
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent the click from navigating to the movie details page
    
    // React 19 `startTransition` marks this state update as a non-blocking UI transition
    startTransition(async () => {
      // INSTANTLY flip the heart icon red/white before the network even knows!
      addOptimisticFavorite(!isFavorite); 
      try {
        // Now quietly fire off the heavy network request in the background
        await toggleFavoriteAsync();
      } catch {
        // Error will be caught and rolled-back by react-query's onError
      }
    });
  }, [isFavorite, addOptimisticFavorite, toggleFavoriteAsync]);

  if (!user) {
    return null;
  }

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

export default memo(FavoriteButton);
