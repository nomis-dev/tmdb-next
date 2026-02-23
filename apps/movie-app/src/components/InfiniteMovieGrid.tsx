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

// -----------------------------------------------------------------------------
// INFINITE VIRTUALIZED MOVIE GRID
// -----------------------------------------------------------------------------
// This component is the workhorse of the /movies page. It handles:
// 1. Fetching movies infinitely as the user scrolls down (useInfiniteQuery).
// 2. Rendering only the movies currently visible on screen to save memory (useWindowVirtualizer).
// 3. Ensuring seamless SEO and instantaneous first-load by accepting `initialMovies` from the server.
export default function InfiniteMovieGrid({
  initialMovies,
  locale,
}: InfiniteMovieGridProps) {
  // 1. Grid Math State: We need to know how many columns are currently rendered
  // so we can chunk our 1D movie array into 2D rows for the virtualizer.
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

  // 2. Responsive Grid Calculation:
  // We use CSS Grid (grid-cols-2 md:grid-cols-3 etc.) to handle responsiveness.
  // This function reads the actual computed CSS to tell React how many columns exist currently.
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


  // 3. Scroll Restoration:
  // If the user lands on a new search, forcefully reset scroll to top.
  useEffect(() => {
    if (!sessionStorage.getItem('tmdb_scroll_pos')) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [searchQuery]);

  // If the current search query matches what the page originally loaded with,
  // we can use the `initialMovies` passed from the Server Component (Zero Loading Screen!).
  const shouldUseInitialData = searchQuery === initialQueryRef.current;

  // 4. Infinite Data Fetching logic via React Query
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

  // Flatten the React Query pages (array of arrays) into a single 1D array of movies
  const allMovies = data ? data.pages.flat() : [];

  // 5. Virtualization Prep: Chunk the 1D array into rows based on current column count
  const virtualRows: Movie[][] = [];
  for (let i = 0; i < allMovies.length; i += columns) {
    virtualRows.push(allMovies.slice(i, i + columns));
  }

  // 6. Window Virtualizer Setup
  // It only renders items in the precise pixel range of the window's current scroll position.
  const virtualizer = useWindowVirtualizer({
    // Add +1 fake row at the end if there is more data to load (to trigger fetchNextPage)
    count: hasNextPage ? virtualRows.length + 1 : virtualRows.length,
    estimateSize: () => 350, // rough height of a movie card
    overscan: 5, // render 5 rows above and below the fold to prevent flickering
    measureElement: (element) => element?.getBoundingClientRect().height,
  });

  // 7. Infinite Scroll Intersection Observer Replacement
  // Instead of IntersectionObserver, we check if the last rendered virtual item
  // is close to the bottom of the data set. If yes, fetch the next page!
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

      {isLoading && searchQuery && (
         <div className="flex justify-center py-20">
           <LoadingSpinner size="md" />
         </div>
      )}

      {!isLoading && allMovies.length > 0 && (
        <>
          {/* 
            8. The "Invisible Ghost Grid": 
            We render a hidden div utilizing Tailwind CSS grid classes. 
            Why? Because the resizeObserver uses THIS invisible element to calculate 
            how many `columns` we should have at the current screen size. 
          */}
          <div
            ref={gridRef}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 invisible absolute"
            aria-hidden="true"
          >
            <div />
          </div>

          {/* 9. The Actual Virtualized Container */}
          <div
            className="relative w-full"
            style={{ height: `${virtualizer.getTotalSize()}px` }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const isLoaderRow = virtualRow.index > virtualRows.length - 1;
              const moviesInRow = virtualRows[virtualRow.index];

              // Determine if the movie is currently visible on screen (or very close to it)
              // We pass this boolean to <MovieCard priority={isVisible} />.
              // If true, Next/Image will load the image immediately. 
              // If false, Next/Image will natively lazy-load the image, saving tons of bandwidth.
              const isVisible =
                virtualRow.index < 2 ||
                (virtualRow.start >= (virtualizer.scrollOffset || 0) - 100 &&
                  virtualRow.start < (virtualizer.scrollOffset || 0) + (typeof window !== 'undefined' ? window.innerHeight : 1000));

              return (
                <div
                  key={virtualRow.index}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  // We manually position each row absolutely using the top `start` coordinate calculated by the virtualizer
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
                        priority={isVisible}
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
