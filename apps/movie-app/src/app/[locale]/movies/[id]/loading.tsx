import { Skeleton } from '@tmdb/ui';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="relative h-[60vh] w-full">
        <Skeleton className="absolute inset-0 h-full w-full bg-slate-800/50" />
      </div>

      <div className="relative z-20 -mt-96 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mb-6">
          <Skeleton className="h-6 w-32 bg-slate-700/50" />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0">
            <div className="relative w-64 h-96 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800">
              <Skeleton className="h-full w-full bg-slate-700/30" />
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <Skeleton className="h-12 w-3/4 mb-2 bg-slate-700/50" />
              <Skeleton className="h-6 w-1/2 bg-slate-700/30" />
            </div>

            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-16 bg-slate-700/30" />
              <div className="h-1 w-1 rounded-full bg-slate-700" />
              <Skeleton className="h-6 w-12 bg-slate-700/30" />
              <div className="h-1 w-1 rounded-full bg-slate-700" />
              <Skeleton className="h-6 w-16 bg-slate-700/30" />
            </div>

            <div className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full bg-slate-700/50" />
              <Skeleton className="h-10 w-10 rounded-full bg-slate-700/50" />
              <Skeleton className="h-10 w-10 rounded-full bg-slate-700/50" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-20 rounded-full bg-slate-700/30" />
              <Skeleton className="h-8 w-24 rounded-full bg-slate-700/30" />
              <Skeleton className="h-8 w-16 rounded-full bg-slate-700/30" />
            </div>

            <div>
              <Skeleton className="h-8 w-32 mb-3 bg-slate-700/50" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-slate-700/30" />
                <Skeleton className="h-4 w-full bg-slate-700/30" />
                <Skeleton className="h-4 w-4/5 bg-slate-700/30" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div>
                <Skeleton className="h-4 w-20 mb-1 bg-slate-700/30" />
                <Skeleton className="h-5 w-32 bg-slate-700/50" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-1 bg-slate-700/30" />
                <Skeleton className="h-5 w-24 bg-slate-700/50" />
              </div>
            </div>
            
            <div className="pt-4">
                <Skeleton className="h-8 w-32 mb-4 bg-slate-700/50" />
                <Skeleton className="aspect-video w-full rounded-xl bg-slate-800/50" />
            </div>

          </div>
        </div>

        <div className="mt-12">
          <Skeleton className="h-8 w-40 mb-6 bg-slate-700/50" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[2/3] rounded-lg bg-slate-800" />
                <Skeleton className="h-4 w-3/4 bg-slate-700/30" />
                <Skeleton className="h-3 w-1/2 bg-slate-700/20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
