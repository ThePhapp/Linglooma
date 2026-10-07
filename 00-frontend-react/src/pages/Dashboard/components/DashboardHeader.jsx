import { useContext } from 'react';
import { CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';

const DashboardHeader = () => {
  const { auth } = useContext(AuthContext);
  const name = auth?.user?.username || 'Student';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-brand-700">IELTS workspace</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{greeting}, {name}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">A clear next step, your saved progress, and today’s practice in one place.</p>
      </div>
      <Link
        to="/admin/study-plan"
        className="inline-flex min-h-10 w-fit items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
      >
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        Study plan
      </Link>
    </header>
  );
};

export default DashboardHeader;
