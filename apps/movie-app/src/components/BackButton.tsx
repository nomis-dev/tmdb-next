'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function BackButton() {
  const t = useTranslations('MovieDetail');

  const content = (
    <>
      <div className="p-1.5 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
        <svg
          className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
      </div>
      <span className="font-medium text-white/90 group-hover:text-white transition-colors text-sm pr-1">
        {t('backToMovies')}
      </span>
    </>
  );

  const className = "inline-flex items-center gap-3 px-2 py-2 pr-4 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer active:scale-95 mb-2";

  if (typeof window !== 'undefined' && window.history.length > 2) {
    return (
      <button 
        type="button" 
        onClick={() => window.history.back()} 
        className={className}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href="/movies"
      prefetch
      className={className}
    >
      {content}
    </Link>
  );
}
