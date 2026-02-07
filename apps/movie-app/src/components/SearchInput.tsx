'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useParams, usePathname, useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

import { useTranslations } from 'next-intl';

export default function SearchInput() {
  const t = useTranslations('NavBar');
  const searchParams = useSearchParams();
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const locale = params.locale;
  
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 400);

  const lastExecutedQuery = useRef<string | null>(null);

  useEffect(() => {
    const isHomePage = pathname === `/${locale}` || pathname === '/';
    
    if (debouncedQuery === lastExecutedQuery.current) {
      return;
    }

    if (debouncedQuery) {
      const newUrl = `/${locale}?q=${encodeURIComponent(debouncedQuery)}`;
      
      if (isHomePage) {
        window.history.replaceState(null, '', newUrl);
        lastExecutedQuery.current = debouncedQuery;
      } else {
        lastExecutedQuery.current = debouncedQuery;
        router.push(newUrl);
      }
    } else if (isHomePage && lastExecutedQuery.current !== '') {
      window.history.replaceState(null, '', `/${locale}`);
      lastExecutedQuery.current = '';
    }
  }, [debouncedQuery, locale, pathname, router]);

  useEffect(() => {
    const currentParam = searchParams.get('q') || '';
    if (currentParam && lastExecutedQuery.current === null) {
        lastExecutedQuery.current = currentParam;
    }
  }, [searchParams]);

  const isPending = query !== debouncedQuery;

  return (
    <div className="relative group w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className={`h-4 w-4 transition-colors ${
            isPending
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
