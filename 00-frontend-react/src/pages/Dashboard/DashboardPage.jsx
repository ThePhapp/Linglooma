import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, BookOpen, CalendarDays, Headphones, History, Mic, NotebookPen, PenLine, RefreshCw, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '@/services/apiClient';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import StatePanel from '@/components/ui/StatePanel';
import DashboardHeader from './components/DashboardHeader';

const skillMeta = {
  reading: { label: 'Reading', icon: BookOpen, href: '/admin/features/reading', color: 'bg-blue-100 text-blue-700' },
  listening: { label: 'Listening', icon: Headphones, href: '/admin/features/listening', color: 'bg-rose-100 text-rose-700' },
  speaking: { label: 'Speaking', icon: Mic, href: '/admin/features/lesson', color: 'bg-violet-100 text-violet-700' },
  writing: { label: 'Writing', icon: PenLine, href: '/admin/features/writing', color: 'bg-emerald-100 text-emerald-700' }
};

const formatScore = item => item.score === null ? 'No score yet' : item.scoreScale === 9 ? `Band ${item.score.toFixed(1)}` : `${item.score.toFixed(1)}%`;

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/api/learning/overview');
      setOverview(response?.data || null);
    } catch {
      setError('Your learning overview could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOverview(); }, [loadOverview]);

  return (
    <main className="page-shell">
      <DashboardHeader />

      {loading ? (
        <div className="mt-8 space-y-8" aria-label="Loading learning overview">
          <Skeleton className="h-40 rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map(item => <Skeleton key={item} className="h-36 rounded-xl" />)}</div>
        </div>
      ) : error || !overview ? (
        <StatePanel className="mt-8" tone="error" icon={<RefreshCw className="h-5 w-5" />} title="Learning overview unavailable" description={error} action={<Button onClick={loadOverview}>Try again</Button>} />
      ) : (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-3" aria-label="Learning summary">
            <Link to="/admin/study-plan" className="rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-300"><div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><Target className="h-4 w-4 text-brand-700" /> IELTS target</div><p className="mt-2 text-2xl font-bold text-slate-950">{overview.profile?.target_band ? `Band ${Number(overview.profile.target_band).toFixed(1)}` : 'Set your goal'}</p><p className="mt-1 text-xs text-slate-500">{overview.profile?.exam_date ? `Exam ${new Date(overview.profile.exam_date).toLocaleDateString()}` : 'Add an exam date and weekly plan'}</p></Link>
            <Link to="/admin/study-plan" className="rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-300"><div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><CalendarDays className="h-4 w-4 text-brand-700" /> Today’s practice</div><p className="mt-2 text-2xl font-bold text-slate-950">{overview.todayPractice.length}</p><p className="mt-1 text-xs text-slate-500">{overview.todayPractice.length ? `${overview.todayPractice.reduce((sum, item) => sum + Number(item.duration_minutes || 0), 0)} planned minutes` : 'No tasks planned for today'}</p></Link>
            <Link to="/admin/mistakes" className="rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-300"><div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><NotebookPen className="h-4 w-4 text-brand-700" /> Mistakes due</div><p className="mt-2 text-2xl font-bold text-slate-950">{overview.dueMistakes}</p><p className="mt-1 text-xs text-slate-500">Review due mistakes with spaced repetition</p></Link>
          </section>

          {overview.activeSessions?.length > 0 && <section className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-sm font-semibold text-emerald-800">Continue where you left off</p><div className="mt-3 flex flex-wrap gap-3">{overview.activeSessions.slice(0, 3).map(session => <Link key={session.id} to={session.skill === 'writing' && session.source_id ? `/admin/features/writing/${session.source_id}${session.mode === 'exam' ? '?mode=exam' : ''}` : skillMeta[session.skill]?.href || '/admin/features'} className="inline-flex min-h-11 items-center rounded-lg bg-white px-4 text-sm font-semibold text-emerald-900 shadow-sm">Resume {session.skill}</Link>)}</div></section>}

          <section className="mt-8 rounded-xl border border-brand-200 bg-brand-50 p-5 sm:p-6" aria-labelledby="focus-heading">
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-700"><Sparkles className="h-4 w-4" aria-hidden="true" /> Focus next</div>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {overview.recommendations.map((item, index) => (
                <Link key={item.id} to={item.href} className={`group rounded-xl border bg-white p-4 hover:border-brand-300 ${index === 0 ? 'border-brand-300' : 'border-slate-200'}`}>
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-700">{index === 0 ? 'Recommended' : skillMeta[item.skill]?.label || 'Practice'}</span>
                  <strong id={index === 0 ? 'focus-heading' : undefined} className="mt-1 block text-slate-950">{item.title}</strong>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">{item.reason}</span>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">Start <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-10" aria-labelledby="progress-heading">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div><h2 id="progress-heading" className="text-xl font-bold text-slate-950">Current progress</h2><p className="mt-1 text-sm text-slate-600">Averages use only your saved, scored attempts.</p></div>
              <p className="text-sm font-medium text-slate-500">{overview.summary.completedPractices} completed practice{overview.summary.completedPractices === 1 ? '' : 's'}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {overview.progress.map(item => {
                const meta = skillMeta[item.skill];
                const Icon = meta.icon;
                return (
                  <Link key={item.skill} to={meta.href} className="rounded-xl border border-slate-200 bg-white p-5 hover:border-brand-300">
                    <div className="flex items-center justify-between"><span className={`flex h-10 w-10 items-center justify-center rounded-lg ${meta.color}`}><Icon className="h-5 w-5" /></span><span className="text-xs font-semibold text-slate-500">{item.attempts} attempt{item.attempts === 1 ? '' : 's'}</span></div>
                    <h3 className="mt-4 font-bold text-slate-950">{meta.label}</h3>
                    <p className={`mt-1 text-lg font-bold ${item.score === null ? 'text-slate-400' : 'text-brand-700'}`}>{formatScore(item)}</p>
                    {!item.hasData && item.skill === 'listening' && <p className="mt-2 text-xs leading-5 text-slate-500">Session-only; not included in saved progress.</p>}
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="mt-10" aria-labelledby="activity-heading">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div><h2 id="activity-heading" className="text-xl font-bold text-slate-950">Recent activity</h2><p className="mt-1 text-sm text-slate-600">Your latest saved practice across skills.</p></div>
              <Link to="/admin/history" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-brand-700">View all <ArrowRight className="h-4 w-4" /></Link>
            </div>
            {overview.recentActivity.length ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {overview.recentActivity.map((item, index) => (
                  <Link key={item.id} to={item.href} className={`flex items-center gap-3 p-4 hover:bg-slate-50 ${index ? 'border-t border-slate-200' : ''}`}>
                    <History className="h-5 w-5 shrink-0 text-slate-400" />
                    <span className="min-w-0 flex-1"><strong className="block truncate text-sm text-slate-900">{item.activity}</strong><span className="text-xs capitalize text-slate-500">{item.skill} · {new Date(item.completedAt).toLocaleDateString()}</span></span>
                    <span className="text-sm font-semibold text-brand-700">{formatScore(item)}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <StatePanel icon={<History className="h-5 w-5" />} title="No saved activity yet" description="Complete a reading, writing, or speaking activity to start building your learning history." action={<Link to="/admin/features" className="inline-flex min-h-11 items-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white">Choose a practice</Link>} />
            )}
          </section>

          <section className="mt-10 grid gap-4 lg:grid-cols-2" aria-label="Weekly learning review">
            <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-semibold text-brand-700">This week</p><h2 className="mt-1 text-xl font-bold text-slate-950">Weekly review</h2><dl className="mt-4 grid grid-cols-3 gap-3 text-center"><div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">Completed</dt><dd className="mt-1 text-xl font-bold text-slate-950">{overview.weeklyReview.practicesCompleted}</dd></div><div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">Most practiced</dt><dd className="mt-1 text-sm font-bold capitalize text-slate-950">{overview.weeklyReview.mostPracticed || '—'}</dd></div><div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">Focus</dt><dd className="mt-1 text-sm font-bold capitalize text-slate-950">{overview.weeklyReview.needsAttention || 'More data'}</dd></div></dl></div>
            <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-semibold text-brand-700">Milestones</p><h2 className="mt-1 text-xl font-bold text-slate-950">Useful achievements</h2>{overview.achievements.length ? <ul className="mt-4 space-y-2">{overview.achievements.map(item => <li key={item.id} className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">{item.title}</li>)}</ul> : <p className="mt-4 text-sm leading-6 text-slate-600">Complete your first saved practice to earn a learning milestone.</p>}</div>
          </section>
        </>
      )}
    </main>
  );
}
