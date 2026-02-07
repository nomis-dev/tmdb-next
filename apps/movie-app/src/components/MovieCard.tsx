'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import MovieImage from '@/components/MovieImage';
import { Skeleton } from '@tmdb/ui';
import FavoriteButton from './FavoriteButton';

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string;
  rating: number;
  priority?: boolean;
  isFavorite?: boolean;
}

export default function MovieCard({
  id,
  title,
  posterPath,
  rating,
  priority = false,
  isFavorite = false,
}: MovieCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Link 
      href={`/movie/${id}`} 
      className="block group mb-8" 
      prefetch={true}
      onClick={() => {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('tmdb_scroll_pos', window.scrollY.toString());
        }
      }}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-secondary/20">
        {posterPath ? (
          <>
            <MovieImage
              src={posterPath}
              alt={title}
              fill
              className={`group-hover:scale-110`}
              sizes="(max-width: 768px) 33vw, 20vw"
              priority={priority}
              onLoad={() => setIsLoaded(true)}
            />
            {!isLoaded && (
              <Skeleton className="absolute inset-0 h-full w-full rounded-xl" />
            )}
          </>
        ) : (
          <Skeleton className="absolute inset-0 h-full w-full rounded-xl" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1 z-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-3 h-3 text-yellow-500"
          >
            <path
              fillRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs font-bold text-white">{rating}</span>
        </div>

        <FavoriteButton
          movieId={id}
          title={title}
          posterPath={posterPath}
          rating={rating}
          isFavorite={isFavorite}
          className="absolute top-2 left-2 z-20 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 scale-90 hover:scale-100"
        />
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-white group-hover:text-accent transition-colors duration-200 truncate">
          {title}
        </h3>
      </div>
    </Link>
  );
}


