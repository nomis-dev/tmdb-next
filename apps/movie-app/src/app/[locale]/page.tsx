import InfiniteMovieGrid from '@/components/InfiniteMovieGrid';
import { TmdbService } from '@/services/tmdb-service';

export default async function Index({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const initialMovies = await TmdbService.getPopularMovies(locale);

  return <InfiniteMovieGrid initialMovies={initialMovies} locale={locale} />
}
