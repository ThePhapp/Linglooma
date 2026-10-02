import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, NotebookPen, RefreshCw, RotateCcw, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '@/services/apiClient';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import Skeleton from '@/components/ui/Skeleton';
import StatePanel from '@/components/ui/StatePanel';

const practiceLinks = { writing: '/admin/features/writing', reading: '/admin/features/reading', speaking: '/admin/features/lesson', listening: '/admin/features/listening' };

export default function MistakeBookPage() {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [skill, setSkill] = useState('all');
  const [status, setStatus] = useState('review');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await apiClient.get('/api/learning/mistakes', { params: { status: status === 'all' ? undefined : status, skill: skill === 'all' ? undefined : skill } });
      setMistakes(Array.isArray(response.data) ? response.data : []);
    } catch { setError('Your Mistake Book could not be loaded.'); }
    finally { setLoading(false); }
  }, [skill, status]);
  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? mistakes.filter(item => [item.problem, item.original_answer, item.corrected_version, item.category].some(value => String(value || '').toLowerCase().includes(term))) : mistakes;
  }, [mistakes, query]);

  const review = async (item, understood) => {
    const response = await apiClient.patch(`/api/learning/mistakes/${item.id}/review`, { understood });
    setMistakes(values => status === 'all' ? values.map(value => value.id === item.id ? response.data : value) : values.filter(value => value.id !== item.id));
  };

  return (
    <main className="page-shell">
      <PageHeader eyebrow="Smart review" title="My Mistakes" description="Review structured mistakes extracted from real Writing, Reading, and Speaking feedback. Review intervals follow a simple 1–3–7–14–30 day schedule." />
      <div className="mt-7 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <label className="relative"><span className="sr-only">Search mistakes</span><Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" /><input className="form-control pl-10" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search problem or correction" /></label>
        <select className="form-control md:w-40" value={skill} onChange={event => setSkill(event.target.value)} aria-label="Filter by skill"><option value="all">All skills</option><option value="writing">Writing</option><option value="reading">Reading</option><option value="speaking">Speaking</option><option value="listening">Listening</option></select>
        <select className="form-control md:w-40" value={status} onChange={event => setStatus(event.target.value)} aria-label="Filter by status"><option value="review">To review</option><option value="understood">Understood</option><option value="all">All status</option></select>
      </div>

      {loading ? <div className="mt-6 space-y-3">{[1, 2, 3].map(item => <Skeleton key={item} className="h-56" />)}</div>
        : error ? <StatePanel className="mt-6" tone="error" icon={<RefreshCw className="h-5 w-5" />} title="Mistakes unavailable" description={error} action={<Button onClick={load}>Try again</Button>} />
        : !visible.length ? <StatePanel className="mt-6" icon={<NotebookPen className="h-5 w-5" />} title="No mistakes in this view" description="Complete scored practice or change the filters. New supported feedback is added automatically." action={<Link to="/admin/features" className="inline-flex min-h-11 items-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white">Start practice</Link>} />
        : <div className="mt-6 grid gap-4 lg:grid-cols-2">{visible.map(item => <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex gap-2"><span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold capitalize text-brand-700">{item.skill}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{String(item.category).replaceAll('_', ' ')}</span></div><span className="text-xs text-slate-500">Review stage {item.review_stage}/5</span></div>{item.original_answer && <div className="mt-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Original</p><p className="mt-1 rounded-lg bg-red-50 p-3 text-sm leading-6 text-red-900">{item.original_answer}</p></div>}<div className="mt-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Issue</p><p className="mt-1 text-sm leading-6 text-slate-700">{item.problem}</p></div>{item.corrected_version && <div className="mt-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Correction</p><p className="mt-1 rounded-lg bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">{item.corrected_version}</p></div>}{item.suggestion && <p className="mt-3 text-sm leading-6 text-slate-600">{item.suggestion}</p>}<div className="mt-5 flex flex-wrap gap-2 border-t border-slate-200 pt-4"><Button size="small" onClick={() => review(item, true)}><CheckCircle2 className="h-4 w-4" /> Understood</Button><Button size="small" variant="secondary" onClick={() => review(item, false)}><RotateCcw className="h-4 w-4" /> Review later</Button><Link to={practiceLinks[item.skill]} className="inline-flex min-h-9 items-center px-2 text-sm font-semibold text-brand-700">Practice again</Link></div></article>)}</div>}
    </main>
  );
}
