import { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Headphones,
  History,
  Mic,
  NotebookPen,
  PenLine,
  RefreshCw,
  Sparkles,
  Target,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '@/services/apiClient';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import StatePanel from '@/components/ui/StatePanel';
import DashboardHeader from './components/DashboardHeader';

const skillMeta = {
  reading: {
    label: 'Reading',
    icon: BookOpen,
    href: '/admin/features/reading',
    iconStyle: 'bg-blue-50 text-blue-700',
    barStyle: 'bg-blue-600',
  },
  listening: {
    label: 'Listening',
    icon: Headphones,
    href: '/admin/features/listening',
    iconStyle: 'bg-rose-50 text-rose-700',
    barStyle: 'bg-rose-600',
  },
  speaking: {
    label: 'Speaking',
    icon: Mic,
    href: '/admin/features/lesson',
    iconStyle: 'bg-violet-50 text-violet-700',
    barStyle: 'bg-violet-600',
  },
  writing: {
    label: 'Writing',
    icon: PenLine,
    href: '/admin/features/writing',
    iconStyle: 'bg-emerald-50 text-emerald-700',
    barStyle: 'bg-emerald-600',
  },
};

const formatScore = item => {
  if (item.score === null || item.score === undefined) return 'No score yet';
  return item.scoreScale === 9 ? `Band ${Number(item.score).toFixed(1)}` : `${Number(item.score).toFixed(1)}%`;
};

const getScorePercent = item => {
  if (item.score === null || item.score === undefined) return 0;
  const normalized = item.scoreScale === 9 ? (Number(item.score) / 9) * 100 : Number(item.score);
  return Math.min(100, Math.max(0, normalized));
};

const formatDate = value => {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const formatStatus = status => {
  if (status === 'completed') return 'Completed';
  if (status === 'skipped') return 'Skipped';
  return 'Planned';
};

const statusStyle = status => {
  if (status === 'completed') return 'bg-emerald-50 text-emerald-700';
  if (status === 'skipped') return 'bg-slate-100 text-slate-500';
  return 'bg-brand-50 text-brand-700';
};

const getSessionHref = session => {
  if (session.skill === 'writing' && session.source_id) {
    return `/admin/features/writing/${session.source_id}${session.mode === 'exam' ? '?mode=exam' : ''}`;
  }
  return skillMeta[session.skill]?.href || '/admin/features';
};

const SummaryCard = ({ href, icon: Icon, iconStyle, label, value, detail }) => (
  <Link
    to={href}
    className="group rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-brand-300 hover:bg-slate-50"
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
      </div>
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconStyle}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
    </div>
    <p className="mt-3 text-xs leading-5 text-slate-500">{detail}</p>
  </Link>
);

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

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  return (
    <main className="page-shell">
      <DashboardHeader />

      {loading ? (
        <div className="mt-8 space-y-6" aria-label="Loading learning overview">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map(item => <Skeleton key={item} className="h-32 rounded-2xl" />)}
          </div>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
            <Skeleton className="h-[27rem] rounded-2xl" />
            <Skeleton className="h-[27rem] rounded-2xl" />
          </div>
        </div>
      ) : error || !overview ? (
        <StatePanel
          className="mt-8"
          tone="error"
          icon={<RefreshCw className="h-5 w-5" />}
          title="Learning overview unavailable"
          description={error}
          action={<Button variant="outline" onClick={loadOverview}><RefreshCw className="h-4 w-4" /> Try again</Button>}
        />
      ) : (
        <>
          <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Learning snapshot">
            <SummaryCard
              href="/admin/study-plan"
              icon={Target}
              iconStyle="bg-blue-50 text-blue-700"
              label="IELTS target"
              value={overview.profile?.target_band ? `Band ${Number(overview.profile.target_band).toFixed(1)}` : 'Not set'}
              detail={overview.profile?.exam_date ? `Exam date: ${formatDate(overview.profile.exam_date)}` : 'Set a target and exam date'}
            />
            <SummaryCard
              href="/admin/study-plan"
              icon={CalendarDays}
              iconStyle="bg-sky-50 text-sky-700"
              label="Today’s practice"
              value={overview.todayPractice.length}
              detail={overview.todayPractice.length ? `${overview.todayPractice.reduce((sum, item) => sum + Number(item.duration_minutes || 0), 0)} planned minutes` : 'No tasks planned today'}
            />
            <SummaryCard
              href="/admin/mistakes"
              icon={NotebookPen}
              iconStyle="bg-amber-50 text-amber-700"
              label="Mistakes to review"
              value={overview.dueMistakes}
              detail={overview.dueMistakes ? 'Spaced repetition is ready' : 'You are caught up for now'}
            />
            <SummaryCard
              href="/admin/history"
              icon={CheckCircle2}
              iconStyle="bg-emerald-50 text-emerald-700"
              label="Completed practice"
              value={overview.summary.completedPractices}
              detail={`${overview.summary.activeSkills} of 4 skills have saved activity`}
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
            <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="focus-heading">
              <header className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-brand-700">Next best step</p>
                  <h2 id="focus-heading" className="mt-1 text-lg font-semibold text-slate-950">Focus next</h2>
                </div>
                <Link to="/admin/features" className="pt-1 text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline">View all skills</Link>
              </header>

              {overview.activeSessions?.length > 0 && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700">
                      <Clock3 className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-emerald-900">Continue where you left off</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {overview.activeSessions.slice(0, 3).map(session => (
                          <Link
                            key={session.id}
                            to={getSessionHref(session)}
                            className="inline-flex min-h-9 items-center rounded-lg bg-white px-3 text-sm font-medium text-emerald-900 transition-colors hover:bg-emerald-100"
                          >
                            Resume {skillMeta[session.skill]?.label || session.skill}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {overview.recommendations?.length ? (
                <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(220px,0.85fr)]">
                  {(() => {
                    const recommendation = overview.recommendations[0];
                    const meta = skillMeta[recommendation.skill] || skillMeta.reading;
                    const Icon = meta.icon;
                    return (
                      <Link
                        to={recommendation.href}
                        className="group flex min-h-56 flex-col rounded-xl border border-brand-200 bg-brand-50 p-4 transition-colors hover:border-brand-400 hover:bg-brand-100"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${meta.iconStyle}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-brand-700">Recommended</span>
                        </div>
                        <div className="mt-5">
                          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{meta.label}</p>
                          <h3 className="mt-1 text-base font-semibold leading-6 text-slate-950">{recommendation.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-700">{recommendation.reason}</p>
                        </div>
                        <span className="mt-auto flex items-center gap-1 pt-5 text-sm font-semibold text-brand-700">
                          Start practice <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                        </span>
                      </Link>
                    );
                  })()}

                  <div className="rounded-xl border border-slate-200 px-4">
                    {overview.recommendations.slice(1).map((recommendation, index) => {
                      const meta = skillMeta[recommendation.skill] || skillMeta.reading;
                      const Icon = meta.icon;
                      return (
                        <Link key={recommendation.id} to={recommendation.href} className={`group flex gap-3 py-4 ${index ? 'border-t border-slate-200' : ''}`}>
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.iconStyle}`}><Icon className="h-4 w-4" aria-hidden="true" /></span>
                          <span className="min-w-0">
                            <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{meta.label}</span>
                            <strong className="mt-1 block text-sm leading-5 text-slate-950">{recommendation.title}</strong>
                            <span className="mt-1 block text-sm leading-5 text-slate-600">{recommendation.reason}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-slate-500">Complete a practice to get your next recommendation.</p>
              )}
            </section>

            <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="today-heading">
              <header className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">Your plan</p>
                  <h2 id="today-heading" className="mt-1 text-lg font-semibold text-slate-950">Today’s practice</h2>
                </div>
                <Link to="/admin/study-plan" className="pt-1 text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline">Open plan</Link>
              </header>

              {overview.todayPractice.length ? (
                <div className="divide-y divide-slate-200 border-t border-slate-200">
                  {overview.todayPractice.map(item => {
                    const meta = skillMeta[item.skill] || skillMeta.reading;
                    const Icon = meta.icon;
                    return (
                      <Link key={item.id} to={item.href || '/admin/study-plan'} className="group flex gap-3 py-4 first:pt-4 last:pb-0">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.iconStyle}`}><Icon className="h-4 w-4" aria-hidden="true" /></span>
                        <span className="min-w-0 flex-1">
                          <strong className="block text-sm leading-5 text-slate-950">{item.title}</strong>
                          <span className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> {item.duration_minutes} minutes</span>
                        </span>
                        <span className={`self-start rounded-full px-2 py-1 text-xs font-medium ${statusStyle(item.status)}`}>{formatStatus(item.status)}</span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-slate-500">No practice is planned for today.</p>
              )}
            </section>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="progress-heading">
              <header className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">Saved results</p>
                  <h2 id="progress-heading" className="mt-1 text-lg font-semibold text-slate-950">Progress by skill</h2>
                </div>
                <Link to="/admin/history" className="pt-1 text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline">View history</Link>
              </header>

              <div className="divide-y divide-slate-200 border-t border-slate-200">
                {overview.progress.map(item => {
                  const meta = skillMeta[item.skill];
                  const Icon = meta.icon;
                  const percent = getScorePercent(item);
                  return (
                    <Link key={item.skill} to={meta.href} className="group flex gap-3 py-4 first:pt-4 last:pb-0">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.iconStyle}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-3">
                          <strong className="text-sm font-semibold text-slate-950">{meta.label}</strong>
                          <span className={`shrink-0 text-sm font-semibold ${item.score === null ? 'text-slate-400' : 'text-slate-950'}`}>{formatScore(item)}</span>
                        </span>
                        <span className="mt-3 block h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                          <span className={`block h-full rounded-full ${item.score === null ? 'bg-slate-300' : meta.barStyle}`} style={{ width: `${percent}%` }} />
                        </span>
                        <span className="mt-2 block text-xs text-slate-500">
                          {item.attempts} saved attempt{item.attempts === 1 ? '' : 's'}{!item.hasData && item.skill === 'listening' ? ' · Session-only practice' : ''}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="week-heading">
              <header>
                <p className="text-sm font-medium text-brand-700">This week</p>
                <h2 id="week-heading" className="mt-1 text-lg font-semibold text-slate-950">Your learning rhythm</h2>
              </header>
              <dl className="mt-5 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <dt className="text-xs text-slate-500">Completed</dt>
                  <dd className="mt-1 text-xl font-semibold text-slate-950">{overview.weeklyReview.practicesCompleted}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <dt className="text-xs text-slate-500">Most practiced</dt>
                  <dd className="mt-1 truncate text-sm font-semibold capitalize text-slate-950">{overview.weeklyReview.mostPracticed || '—'}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <dt className="text-xs text-slate-500">Focus</dt>
                  <dd className="mt-1 truncate text-sm font-semibold capitalize text-slate-950">{overview.weeklyReview.needsAttention || 'More data'}</dd>
                </div>
              </dl>

              <div className="mt-6 border-t border-slate-200 pt-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand-700" aria-hidden="true" />
                  <h3 className="text-base font-semibold text-slate-950">Milestones</h3>
                </div>
                {overview.achievements.length ? (
                  <ul className="mt-3 space-y-2">
                    {overview.achievements.map(item => <li key={item.id} className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"><CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" /> {item.title}</li>)}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-slate-600">Complete your first saved practice to unlock a milestone.</p>
                )}
              </div>
            </section>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="activity-heading">
            <header className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">Keep your record in view</p>
                <h2 id="activity-heading" className="mt-1 text-lg font-semibold text-slate-950">Recent activity</h2>
              </div>
              <Link to="/admin/history" className="pt-1 text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline">View all</Link>
            </header>
            {overview.recentActivity.length ? (
              <div className="divide-y divide-slate-200 border-t border-slate-200">
                {overview.recentActivity.map(item => (
                  <Link key={item.id} to={item.href} className="flex items-center gap-3 py-4 first:pt-4 last:pb-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><History className="h-4 w-4" aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-sm font-medium text-slate-950">{item.activity}</strong>
                      <span className="mt-1 block text-xs capitalize text-slate-500">{item.skill} · {formatDate(item.completedAt)}</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-slate-950">{formatScore(item)}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">Complete a reading, writing, or speaking activity to start building your learning history.</p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
