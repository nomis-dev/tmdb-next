'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useParams, usePathname, useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

import { useIsFetching } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

// A global Search Input component that synchronizes local text state
// with the URL query parameters ?q=... in a highly optimized way.
export default function SearchInput() {
  const t = useTranslations('NavBar');
  const searchParams = useSearchParams();
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const locale = params.locale;

  const initialQuery = searchParams.get('q') || '';
  // 1. Local input state vs Debounced state
  // `query` updates instantly as the user types (for responsive UI rendering).
  const [query, setQuery] = useState(initialQuery);
  // `debouncedQuery` only updates after the user stops typing for 300ms.
  // This prevents sending 10 useless API requests if the user types quickly.
  const debouncedQuery = useDebounce(query, 300);

  // Tracks the last query that was successfully pushed to the URL
  // to prevent infinite render loops between URL changes and local state changes.
  const lastExecutedQuery = useRef<string | null>(null);
  
  // React Query hook to check if any 'movies search' request is currently in flight
  const isFetching = useIsFetching({ queryKey: ['movies', 'search'] });

  // 2. The core logic: Synchronize the Debounced Query with the Browser URL
  useEffect(() => {
    // Check if we are already on the search results page (/movies)
    const isMoviesPage = pathname?.endsWith('/movies');

    // Skip if we've already processed this exact search term
    if (debouncedQuery === lastExecutedQuery.current) {
      return;
    }

    if (debouncedQuery) {
      const newUrl = `/${locale}/movies?q=${encodeURIComponent(debouncedQuery)}`;
      
      if (isMoviesPage) {
        // Optimization: If we are already on /movies, we use `history.replaceState`
        // instead of `router.push`. This updates the URL without adding a new entry
        // to the browser's back button history history for every single letter typed.
        window.history.replaceState(null, '', newUrl);
        lastExecutedQuery.current = debouncedQuery;
      } else {
        // If we are on the Home page or Profile page, we must `router.push`
        // the user to the /movies page so they can see the search results.
        lastExecutedQuery.current = debouncedQuery;
        router.push(newUrl);
      }
    } else if (lastExecutedQuery.current) {
      // User cleared the search box. Remove the ?q=... param from the URL
      if (isMoviesPage) {
        window.history.replaceState(null, '', `/${locale}/movies`);
      }
      
      lastExecutedQuery.current = '';
    }
  }, [debouncedQuery, locale, pathname, router]);

  // 3. Keep local state in sync if the URL changes externally 
  // (e.g., user clicks the browser's Back/Forward button)
  useEffect(() => {
    const currentParam = searchParams.get('q') || '';
    if (currentParam && lastExecutedQuery.current === null) {
      lastExecutedQuery.current = currentParam;
    }
  }, [searchParams]);

  // 4. Loading indicator state:
  // It is 'loading' if either the user is still typing (waiting for debounce payload),
  // OR the network request to TMDB is still hanging.
  const isPending = query !== debouncedQuery || isFetching > 0;

  return (
    <div className="relative group w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className={`h-4 w-4 transition-colors ${isPending
              ? 'text-accent animate-pulse'
              : 'text-slate-400 group-focus-within:text-accent'
            }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <input
        type="text"
        name="search"
        id="navbar-search"
        className="block w-full pl-10 pr-10 py-1.5 border border-white/10 rounded-full leading-5 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:bg-white/10 focus:border-accent transition-all duration-200"
        placeholder={t('searchPlaceholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
          aria-label="Clear search"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
