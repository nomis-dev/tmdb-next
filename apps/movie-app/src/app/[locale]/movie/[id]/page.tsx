import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { TmdbService } from '@/services/tmdb-service';
import MovieImage from '@/components/MovieImage';
import MovieDetailActions from '@/components/MovieDetailActions';

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'MovieDetail' });
  
  const movieId = parseInt(id, 10);

  if (isNaN(movieId)) {
    notFound();
  }

  const movie = await TmdbService.getMovieDetails(movieId, locale);

  if (!movie) {
    notFound();
  }

  const director = movie.credits.crew.find((person) => person.job === 'Director');
  const trailer = movie.videos.results.find(
    (video) => video.type === 'Trailer' && video.site === 'YouTube'
  );

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="relative h-[60vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
        {movie.backdrop_path && (
          <MovieImage
            src={movie.backdrop_path}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        )}
      </div>

      <div className="relative z-20 -mt-96 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
        >
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
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0">
            <div className="relative w-64 h-96 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              {movie.poster_path ? (
                <MovieImage
                  src={movie.poster_path}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 256px"
                />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <span className="text-slate-600">{t('noImage')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-xl text-slate-400 italic">{movie.tagline}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-white font-semibold">
                  {movie.vote_average.toFixed(1)}
                </span>
              </div>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300">{new Date(movie.release_date).getFullYear()}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300">{formatRuntime(movie.runtime)}</span>
            </div>

            <MovieDetailActions
              id={movie.id}
              title={movie.title}
              posterPath={movie.poster_path}
              rating={movie.vote_average}
            />

            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1 rounded-full bg-white/10 text-sm text-slate-300 border border-white/20"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-3">{t('overview')}</h2>
              <p className="text-slate-300 leading-relaxed">{movie.overview}</p>
            </div>

            {director && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-1">{t('director')}</h3>
                <p className="text-white">{director.name}</p>
              </div>
            )}

            {(movie.budget > 0 || movie.revenue > 0) && (
              <div className="grid grid-cols-2 gap-4">
                {movie.budget > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 mb-1">{t('budget')}</h3>
                    <p className="text-white">{formatMoney(movie.budget)}</p>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 mb-1">{t('revenue')}</h3>
                    <p className="text-white">{formatMoney(movie.revenue)}</p>
                  </div>
                )}
              </div>
            )}

            {trailer && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">{t('trailer')}</h2>
                <div className="aspect-video rounded-xl overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}`}
                    title={trailer.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {movie.credits.cast.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">{t('topCast')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {movie.credits.cast.slice(0, 12).map((person) => (
                <div key={person.id} className="group">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-slate-800 mb-2">
                    {person.profile_path ? (
                      <MovieImage
                        src={person.profile_path}
                        alt={person.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-white truncate">{person.name}</h3>
                  <p className="text-xs text-slate-400 truncate">{person.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
