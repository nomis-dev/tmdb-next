import { Skeleton } from '@tmdb/ui';

export default function Loading() {
  const skeletonCards = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20 md:mt-16">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {skeletonCards.map((index) => (
          <div key={index} className="mb-8 animate-pulse">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-slate-800/50">
              <Skeleton className="absolute inset-0 h-full w-full rounded-xl" />
              
              <div className="absolute top-2 right-2 bg-slate-700/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                <Skeleton className="h-3 w-8 rounded" />
              </div>
              
              <div className="absolute top-2 left-2 p-2 rounded-full bg-slate-700/50">
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-5 w-full rounded" />
              <Skeleton className="h-5 w-2/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
