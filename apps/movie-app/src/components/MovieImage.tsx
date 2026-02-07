'use client';

import { useState } from 'react';
import Image from 'next/image';
import tmdbLoader from '@/lib/tmdb-loader';
import { Skeleton } from '@tmdb/ui';

interface MovieImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
}

export default function MovieImage({
  src,
  alt,
  fill,
  priority,
  className,
  sizes,
  width,
  height,
  onLoad,
}: MovieImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <>
      <Image
        loader={tmdbLoader}
        src={src}
        alt={alt}
        fill={fill}
        priority={priority}
        className={`${className} transition-all duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        sizes={sizes}
        width={width}
        height={height}
        onLoad={handleLoad}
      />
      {!isLoaded && (
        <Skeleton className="absolute inset-0 h-full w-full" />
      )}
    </>
  );
}
