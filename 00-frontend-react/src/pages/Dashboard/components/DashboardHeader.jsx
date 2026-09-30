import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

const DashboardHeader = () => {
  const { auth } = useContext(AuthContext);
  const name = auth?.user?.username || 'Student';
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-brand-700">Your learning workspace</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{greeting}, {name}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">Choose a skill and continue with an available IELTS practice activity.</p>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">{name.charAt(0).toUpperCase()}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
          <p className="truncate text-xs text-slate-500">{auth?.user?.email || 'Signed in'}</p>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
