import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, Headphones, History, Mic, PenLine, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '@/services/apiClient';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import Skeleton from '@/components/ui/Skeleton';
import StatePanel from '@/components/ui/StatePanel';

const filters = ['all', 'speaking', 'writing', 'reading', 'listening'];
const skillMeta = {
  speaking: { label: 'Speaking', icon: Mic, color: 'bg-violet-100 text-violet-700' },
  writing: { label: 'Writing', icon: PenLine, color: 'bg-emerald-100 text-emerald-700' },
  reading: { label: 'Reading', icon: BookOpen, color: 'bg-blue-100 text-blue-700' },
  listening: { label: 'Listening', icon: Headphones, color: 'bg-rose-100 text-rose-700' }
};

const formatScore = item => item.score === null
  ? 'Not scored'
  : item.scoreScale === 9 ? `Band ${item.score.toFixed(1)}` : `${item.score.toFixed(1)}%`;

export default function PracticeHistoryPage() {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/api/learning/history');
      setHistory(Array.isArray(response?.data) ? response.data : []);
    } catch {
      setError('Your practice history could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);
  const visible = useMemo(() => filter === 'all' ? history : history.filter(item => item.skill === filter), [filter, history]);

  return (
    <main className="page-shell">
      <PageHeader eyebrow="Learning activity" title="Practice history" description="Speaking, writing, and reading results in one chronological view. Listening remains session-only until server-side persistence is available." />

      <div className="mt-7 flex gap-2 overflow-x-auto pb-2" aria-label="Filter practice history">
        {filters.map(value => (
          <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value} className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold capitalize ${filter === value ? 'bg-brand-600 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>
            {value}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 space-y-3" aria-label="Loading practice history">{[1, 2, 3, 4].map(item => <Skeleton key={item} className="h-24 rounded-xl" />)}</div>
      ) : error ? (
        <StatePanel className="mt-6" icon={<RefreshCw className="h-5 w-5" />} title="History unavailable" description={error} action={<Button onClick={loadHistory}>Try again</Button>} />
      ) : visible.length === 0 ? (
        <StatePanel className="mt-6" icon={<History className="h-5 w-5" />} title={filter === 'all' ? 'No saved practice yet' : `No saved ${filter} practice`} description={filter === 'listening' ? 'Listening exercises currently stay in the active browser session.' : 'Complete a practice activity and it will appear here.'} action={filter !== 'listening' && <Link to="/admin/features" className="inline-flex min-h-11 items-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">Start practising</Link>} />
      ) : (
        <ol className="mt-6 space-y-3">
          {visible.map(item => {
            const meta = skillMeta[item.skill];
            const Icon = meta.icon;
            return (
              <li key={item.id}>
                <Link to={item.href} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-300 sm:flex-row sm:items-center">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${meta.color}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{meta.label}</span>
                    <strong className="mt-1 block truncate text-slate-950">{item.activity}</strong>
                    <span className="mt-1 block text-sm text-slate-500">{item.completedAt ? new Date(item.completedAt).toLocaleString() : 'Date unavailable'}</span>
                  </span>
                  <span className="sm:text-right">
                    <strong className="block text-brand-700">{formatScore(item)}</strong>
                    <span className={`mt-1 block text-xs font-medium ${item.status === 'completed' ? 'text-emerald-700' : 'text-amber-700'}`}>{item.status === 'completed' ? 'Completed' : 'Feedback pending'}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
