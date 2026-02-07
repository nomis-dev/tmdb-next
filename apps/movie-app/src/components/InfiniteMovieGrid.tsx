'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Movie, TmdbService } from '@/services/tmdb-service';
import MovieCard from './MovieCard';
import { LoadingSpinner } from '@tmdb/ui';
import { useAuth } from './AuthProvider';

interface InfiniteMovieGridProps {
  initialMovies: Movie[];
  locale: string;
}

interface Favorite {
  movieId: number;
}

export default function InfiniteMovieGrid({
  initialMovies,
  locale,
}: InfiniteMovieGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(2);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const { user } = useAuth();
  
  const initialQueryRef = useRef(searchQuery);

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

  const updateColumnsFromCSS = useCallback(() => {
    if (gridRef.current) {
      const gridStyles = getComputedStyle(gridRef.current);
      const columnCount = gridStyles.gridTemplateColumns.split(' ').length;
      setColumns(columnCount);
    }
  }, []);

  useEffect(() => {
    updateColumnsFromCSS();

    const resizeObserver = new ResizeObserver(() => {
      updateColumnsFromCSS();
    });

    if (gridRef.current) {
      resizeObserver.observe(gridRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [updateColumnsFromCSS]);

  useEffect(() => {
    const savedPos = sessionStorage.getItem('tmdb_scroll_pos');
    if (savedPos) {
      setTimeout(() => {
        window.scrollTo({ top: parseInt(savedPos), behavior: 'instant' });
        sessionStorage.removeItem('tmdb_scroll_pos');
      }, 100);
    }
  }, []);

  useEffect(() => {
    if (!sessionStorage.getItem('tmdb_scroll_pos')) {
       window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [searchQuery]);

  const shouldUseInitialData = searchQuery === initialQueryRef.current;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ['movies', searchQuery ? 'search' : 'popular', locale, searchQuery],
      queryFn: async ({ pageParam = 1, signal }) => {
        if (searchQuery) {
          return TmdbService.searchMovies(searchQuery, locale, pageParam, signal);
        }
        return TmdbService.getPopularMovies(locale, pageParam);
      },
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length > 0 ? allPages.length + 1 : undefined;
      },
      initialPageParam: 1,
      initialData: shouldUseInitialData ? {
        pages: [initialMovies],
        pageParams: [1],
      } : undefined,
    });

  const allMovies = data ? data.pages.flat() : [];

  const virtualRows: Movie[][] = [];
  for (let i = 0; i < allMovies.length; i += columns) {
    virtualRows.push(allMovies.slice(i, i + columns));
  }

  const virtualizer = useWindowVirtualizer({
    count: hasNextPage ? virtualRows.length + 1 : virtualRows.length,
    estimateSize: () => 350,
    overscan: 5,
    measureElement: (element) => element?.getBoundingClientRect().height,
  });

  useEffect(() => {
    const [lastItem] = [...virtualizer.getVirtualItems()].reverse();

    if (!lastItem) return;

    if (
      lastItem.index >= virtualRows.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allMovies.length,
    isFetchingNextPage,
    virtualizer.getVirtualItems(),
    virtualRows.length,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20 md:mt-16">
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      )}

      {!isLoading && searchQuery && allMovies.length === 0 && (
        <div className="text-center py-20">
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
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
          <p className="text-slate-400">Try different keywords</p>
        </div>
      )}

      {!isLoading && allMovies.length > 0 && (
        <>
          <div
            ref={gridRef}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 invisible absolute"
            aria-hidden="true"
          >
            <div />
          </div>

          <div
            className="relative w-full"
            style={{ height: `${virtualizer.getTotalSize()}px` }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const isLoaderRow = virtualRow.index > virtualRows.length - 1;
              const moviesInRow = virtualRows[virtualRow.index];

              return (
                <div
                  key={virtualRow.index}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  className="absolute top-0 left-0 w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  {isLoaderRow ? (
                    isFetchingNextPage && (
                      <div className="col-span-full">
                        <LoadingSpinner />
                      </div>
                    )
                  ) : (
                    moviesInRow?.map((movie) => (
                      <MovieCard
                        key={movie.id}
                        id={movie.id}
                        title={movie.title}
                        posterPath={movie.poster_path}
                        rating={Number((movie.vote_average || 0).toFixed(1))}
                        priority={virtualRow.index === 0}
                        isFavorite={favorites.some((f) => f.movieId === movie.id)}
                      />
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
