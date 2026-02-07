'use client';

import { useAuth } from './AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import FavoriteButton from './FavoriteButton';

interface MovieDetailActionsProps {
  id: number;
  title: string;
  posterPath: string | null;
  rating: number;
}

interface Favorite {
  movieId: number;
}

export default function MovieDetailActions({ id, title, posterPath, rating }: MovieDetailActionsProps) {
  const { user } = useAuth();
  const t = useTranslations('MovieDetail');

  const { data: favorites = [] } = useQuery<Favorite[]>({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch('/api/favorites');
      if (!res.ok) throw new Error('Failed to fetch favorites');
      return res.json();
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const isFavorite = favorites.some((f) => f.movieId === id);

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
       <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">
          <span className="text-white font-medium text-sm">
            {isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
          </span>
          <FavoriteButton
            movieId={id}
            title={title}
            posterPath={posterPath}
            rating={rating}
            isFavorite={isFavorite}
            className="hover:bg-white/20"
          />
       </div>
    </div>
  );
}
