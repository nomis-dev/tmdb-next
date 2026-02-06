import { Link } from '@/i18n/routing';
export default function NavBar() {

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md border-b border-white/5"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex-shrink-0 flex items-center gap-2">
          <Link
            href="/"
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-purple-500"
          >
            TMDB Next
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2 text-sm text-slate-400">
            <Link
              href="/"
              locale="en"
              className="hover:text-white transition-colors"
            >
              EN
            </Link>
            <span>/</span>
            <Link
              href="/"
              locale="zh"
              className="hover:text-white transition-colors"
            >
              中文
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
