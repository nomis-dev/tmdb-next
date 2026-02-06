import InfiniteMovieGrid from '@/components/InfiniteMovieGrid';
import { TmdbService } from '@/services/tmdb-service';

export default async function Index({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q: query } = await searchParams;

  const initialMovies = query
    ? await TmdbService.searchMovies(query, locale)
    : await TmdbService.getPopularMovies(locale);

  return <InfiniteMovieGrid initialMovies={initialMovies} locale={locale} />
}
