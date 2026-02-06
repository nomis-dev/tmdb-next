'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Movie, TmdbService } from '@/services/tmdb-service';
import MovieCard from './MovieCard';
import { LoadingSpinner } from '@tmdb/ui';

interface InfiniteMovieGridProps {
  initialMovies: Movie[];
  locale: string;
}

export default function InfiniteMovieGrid({
  initialMovies,
  locale,
}: InfiniteMovieGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(2);

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

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['movies', 'popular', locale],
      queryFn: async ({ pageParam = 1 }) => {
        return TmdbService.getPopularMovies(locale, pageParam);
      },
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length > 0 ? allPages.length + 1 : undefined;
      },
      initialPageParam: 1,
      initialData: {
        pages: [initialMovies],
        pageParams: [1],
      },
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-12">
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
                moviesInRow?.map((movie, index) => (
                  <MovieCard
                    key={movie.id}
                    id={movie.id}
                    title={movie.title}
                    posterPath={movie.poster_path}
                    rating={Number(movie.vote_average.toFixed(1))}
                    priority={virtualRow.index === 0}
                  />
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
