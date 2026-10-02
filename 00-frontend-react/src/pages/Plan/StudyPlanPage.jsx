import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Check, RefreshCw, SkipForward, Target } from 'lucide-react';
import apiClient from '@/services/apiClient';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import Skeleton from '@/components/ui/Skeleton';
import StatePanel from '@/components/ui/StatePanel';

const skills = ['speaking', 'writing', 'reading', 'listening'];
const initialForm = { targetBand: 7, currentLevel: 'intermediate', examDate: '', studyDaysPerWeek: 5, minutesPerDay: 30, weeklyPracticeGoal: 5, weakSkills: [] };

const mapProfile = profile => profile ? {
  targetBand: Number(profile.target_band), currentLevel: profile.current_level,
  examDate: profile.exam_date ? String(profile.exam_date).slice(0, 10) : '',
  studyDaysPerWeek: Number(profile.study_days_per_week), minutesPerDay: Number(profile.minutes_per_day),
  weeklyPracticeGoal: Number(profile.weekly_practice_goal), weakSkills: Array.isArray(profile.weak_skills) ? profile.weak_skills : []
} : initialForm;

export default function StudyPlanPage() {
  const [form, setForm] = useState(initialForm);
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [profileResponse, planResponse] = await Promise.all([apiClient.get('/api/learning/profile'), apiClient.get('/api/learning/study-plan')]);
      setForm(mapProfile(profileResponse?.data));
      setPlan(Array.isArray(planResponse?.data) ? planResponse.data : []);
    } catch { setError('Your learning plan could not be loaded. Apply the latest database migration, then try again.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const change = event => setForm(value => ({ ...value, [event.target.name]: event.target.type === 'number' ? Number(event.target.value) : event.target.value }));
  const toggleWeakSkill = skill => setForm(value => ({ ...value, weakSkills: value.weakSkills.includes(skill) ? value.weakSkills.filter(item => item !== skill) : [...value.weakSkills, skill] }));

  const save = async event => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    try {
      const response = await apiClient.put('/api/learning/profile', form);
      setForm(mapProfile(response.data.profile)); setPlan(response.data.plan || []); setMessage('Goals saved and your structured weekly plan is ready.');
    } catch (requestError) { setError(requestError.response?.data?.message || 'Your learning goals could not be saved.'); }
    finally { setSaving(false); }
  };

  const updateItem = async (item, status) => {
    const response = await apiClient.patch(`/api/learning/study-plan/${item.id}`, { status });
    setPlan(items => items.map(value => value.id === item.id ? response.data : value));
  };
  const replaceItem = async item => {
    const response = await apiClient.post(`/api/learning/study-plan/${item.id}/replace`);
    setPlan(items => items.map(value => value.id === item.id ? response.data : value));
  };

  if (loading) return <main className="page-shell"><Skeleton className="h-48" /><Skeleton className="mt-6 h-80" /></main>;

  return (
    <main className="page-shell">
      <PageHeader eyebrow="Personalized learning" title="Goals and study plan" description="Set a realistic IELTS target. Linglooma creates a structured rule-based plan that you can complete, skip, or replace." />
      {error && <StatePanel className="mt-6" tone="error" icon={<RefreshCw className="h-5 w-5" />} title="Plan action failed" description={error} action={!plan.length && <Button onClick={load}>Try again</Button>} />}
      {message && <p role="status" className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={save} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2"><Target className="h-5 w-5 text-brand-700" /><h2 className="font-bold text-slate-950">Learning goal</h2></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label><span className="form-label">Target band</span><input className="form-control" name="targetBand" type="number" min="0" max="9" step="0.5" value={form.targetBand} onChange={change} /></label>
            <label><span className="form-label">Current level</span><select className="form-control" name="currentLevel" value={form.currentLevel} onChange={change}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
            <label><span className="form-label">Exam date</span><input className="form-control" name="examDate" type="date" value={form.examDate} onChange={change} /></label>
            <label><span className="form-label">Study days/week</span><input className="form-control" name="studyDaysPerWeek" type="number" min="1" max="7" value={form.studyDaysPerWeek} onChange={change} /></label>
            <label><span className="form-label">Minutes/day</span><input className="form-control" name="minutesPerDay" type="number" min="5" max="240" step="5" value={form.minutesPerDay} onChange={change} /></label>
            <label><span className="form-label">Weekly practice goal</span><input className="form-control" name="weeklyPracticeGoal" type="number" min="1" max="50" value={form.weeklyPracticeGoal} onChange={change} /></label>
          </div>
          <fieldset className="mt-5"><legend className="form-label">Skills to prioritize</legend><div className="flex flex-wrap gap-2">{skills.map(skill => <button key={skill} type="button" aria-pressed={form.weakSkills.includes(skill)} onClick={() => toggleWeakSkill(skill)} className={`min-h-10 rounded-full border px-4 text-sm font-semibold capitalize ${form.weakSkills.includes(skill) ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-600'}`}>{skill}</button>)}</div></fieldset>
          <Button type="submit" className="mt-6 w-full" isLoading={saving}>Save and generate plan</Button>
        </form>

        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="weekly-plan">
          <div className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-brand-700" /><h2 id="weekly-plan" className="font-bold text-slate-950">Upcoming plan</h2></div>
          {!plan.length ? <p className="mt-5 text-sm leading-6 text-slate-600">Save your learning goal to generate a structured plan.</p> : <ol className="mt-5 space-y-3">{plan.map(item => <li key={item.id} className={`rounded-lg border p-4 ${item.status === 'completed' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{new Date(`${String(item.scheduled_date).slice(0, 10)}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p><h3 className="mt-1 font-semibold text-slate-950">{item.title}</h3><p className="mt-1 text-sm capitalize text-slate-500">{item.skill} · {item.duration_minutes} minutes</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">{item.status}</span></div><div className="mt-3 flex flex-wrap gap-2">{item.status !== 'completed' && <Button size="small" onClick={() => updateItem(item, 'completed')}><Check className="h-4 w-4" /> Complete</Button>}<Button size="small" variant="secondary" onClick={() => updateItem(item, 'skipped')}><SkipForward className="h-4 w-4" /> Skip</Button><Button size="small" variant="ghost" onClick={() => replaceItem(item)}>Replace</Button></div></li>)}</ol>}
        </section>
      </div>
    </main>
  );
}
