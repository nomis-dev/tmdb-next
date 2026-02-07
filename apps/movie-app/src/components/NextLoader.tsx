'use client';

import NextTopLoader from 'nextjs-toploader';

export default function NextLoader() {
  return (
    <NextTopLoader
      color="#E50914"
      initialPosition={0.08}
      crawlSpeed={200}
      height={3}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow="0 0 10px #E50914,0 0 5px #E50914"
      showAtBottom={false}
      zIndex={1600}
    />
  );
}
