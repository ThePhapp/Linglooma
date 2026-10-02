import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, GitCompareArrows, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import apiClient from '@/services/apiClient';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import StatePanel from '@/components/ui/StatePanel';

export default function SpeakingComparisonPage() {
  const { lessonResultId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); setError(''); try { setData(await apiClient.get(`/api/lessons/results/comparison/${lessonResultId}`)); } catch (requestError) { setError(requestError.response?.data?.message || 'Comparison could not be loaded.'); } finally { setLoading(false); } }, [lessonResultId]);
  useEffect(() => { load(); }, [load]);
  if (loading) return <main className="page-shell"><Skeleton className="h-80" /></main>;
  if (error) return <main className="page-shell"><StatePanel tone="error" icon={<RefreshCw className="h-5 w-5" />} title="Comparison unavailable" description={error} action={<Button onClick={load}>Try again</Button>} /></main>;
  const attempts = data?.attempts || [];
  const metrics = ['score', 'accuracy', 'fluency', 'pronunciation'];
  return <main className="page-shell"><Link to="/admin/features/speaking/history" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-brand-700"><ArrowLeft className="h-4 w-4" /> Speaking history</Link><header className="mt-5"><p className="text-sm font-semibold text-brand-700">Speaking retry</p><h1 className="mt-1 text-3xl font-bold text-slate-950">Attempt comparison</h1><p className="mt-2 text-slate-600">Uses saved evaluations only—no additional AI call.</p></header>{attempts.length < 2 ? <StatePanel className="mt-8" icon={<GitCompareArrows className="h-5 w-5" />} title="One more attempt is needed" description="Retry this speaking lesson to unlock a side-by-side comparison." action={<Link to="/admin/features/lesson" className="inline-flex min-h-11 items-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white">Practice again</Link>} /> : <><section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(metric => { const delta = data.comparison?.[metric]; return <div key={metric} className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-semibold capitalize text-slate-600">{metric}</p><p className="mt-2 text-2xl font-bold text-slate-950">{attempts[0][metric] ?? '—'} → {attempts[1][metric] ?? '—'}</p><p className={`mt-2 inline-flex items-center gap-1 text-sm font-semibold ${delta > 0 ? 'text-emerald-700' : delta < 0 ? 'text-red-700' : 'text-slate-500'}`}>{delta > 0 ? <TrendingUp className="h-4 w-4" /> : delta < 0 ? <TrendingDown className="h-4 w-4" /> : null}{delta == null ? 'Not comparable' : `${delta > 0 ? '+' : ''}${delta}`}</p></div>; })}</section><section className="mt-6 grid gap-4 lg:grid-cols-2">{attempts.map((attempt, index) => <article key={attempt.id} className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{index === 0 ? 'First attempt' : 'Latest attempt'}</p><p className="mt-1 text-sm text-slate-500">{new Date(attempt.completed_at).toLocaleString()}</p><h2 className="mt-4 font-bold text-slate-950">Transcript</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{attempt.transcript || 'Transcript was not saved for this attempt.'}</p>{attempt.feedback && <><h2 className="mt-5 font-bold text-slate-950">Feedback</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{attempt.feedback}</p></>}</article>)}</section></>}</main>;
}
