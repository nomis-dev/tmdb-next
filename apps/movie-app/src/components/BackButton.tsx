'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function BackButton() {
  const t = useTranslations('MovieDetail');

  const content = (
    <>
      <svg
        className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      <span>{t('backToMovies')}</span>
    </>
  );

  const className = "inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group cursor-pointer bg-transparent border-none p-0";

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
