import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, LogIn, UserPlus } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="flex min-w-0 items-center gap-2.5 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          onClick={() => navigate('/')}
          aria-label="Go to Linglooma home"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 shadow-sm">
            <HomeIcon className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-bold tracking-tight text-slate-950 sm:text-xl">Linglooma</span>
            <span className="hidden text-xs text-slate-500 sm:block">Focused IELTS practice</span>
          </span>
        </button>

        <nav aria-label="Account" className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 sm:px-4"
            onClick={() => navigate('/login')}
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            <span>Login</span>
          </button>
          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-brand-600 bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 sm:px-4"
            onClick={() => navigate('/register')}
            aria-label="Create an account"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sign up</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
