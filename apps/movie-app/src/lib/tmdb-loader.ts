export default function tmdbLoader({
  src,
  width,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  let size = 'original';

  if (width <= 92) size = 'w92';
  else if (width <= 154) size = 'w154';
  else if (width <= 185) size = 'w185';
  else if (width <= 342) size = 'w342';
  else if (width <= 500) size = 'w500';
  else if (width <= 780) size = 'w780';

  return `https://image.tmdb.org/t/p/${size}${src}`;
}
