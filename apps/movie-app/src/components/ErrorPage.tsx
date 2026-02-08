'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface ErrorPageProps {
  error: Error & { digest?: string };
}

export default function ErrorPage({ error }: ErrorPageProps) {
  const t = useTranslations('ErrorPage');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="mb-6 p-4 bg-red-500/10 rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-white mb-3">{t('title')}</h2>
      <p className="text-slate-400 mb-8 max-w-md">
        {t('message')}
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium border border-slate-700"
        >
          {t('reload')}
        </button>
      </div>
    </div>
  );
}
