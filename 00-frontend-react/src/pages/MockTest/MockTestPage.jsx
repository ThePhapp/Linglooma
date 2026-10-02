import { BookOpen, Clock, Mic, PenLine, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';

const mocks = [
  { skill: 'Speaking', description: 'Timed response with feedback shown after submission.', href: '/admin/features/lesson?mode=mock', icon: Mic },
  { skill: 'Writing', description: 'Task timer, hidden practice tips, and evaluation after submission.', href: '/admin/features/writing?mode=exam', icon: PenLine },
  { skill: 'Reading', description: 'Complete a passage without immediate feedback or retries.', href: '/admin/features/reading?mode=exam', icon: BookOpen }
];

export default function MockTestPage() {
  return <main className="page-shell"><PageHeader eyebrow="Exam preparation" title="Skill-specific mock tests" description="Mock mode limits practice assistance and reveals feedback only after you finish. Full four-skill orchestration is intentionally deferred until Listening has persistent test data." /><div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Before you start:</strong> choose a quiet place, allow the full suggested time, and avoid external help.</div><div className="mt-6 grid gap-4 lg:grid-cols-3">{mocks.map(({ skill, description, href, icon: Icon }) => <article key={skill} className="rounded-xl border border-slate-200 bg-white p-6"><span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><Icon className="h-5 w-5" /></span><h2 className="mt-4 text-xl font-bold text-slate-950">{skill} mock</h2><p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{description}</p><div className="mt-4 flex gap-3 text-xs font-semibold text-slate-500"><span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> Timed</span><span className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> No hints</span></div><Link to={href} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">Choose test</Link></article>)}</div></main>;
}
