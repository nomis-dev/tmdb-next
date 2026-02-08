'use client';

import ErrorPage from '@/components/ErrorPage';

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return <ErrorPage error={error} />;
}
