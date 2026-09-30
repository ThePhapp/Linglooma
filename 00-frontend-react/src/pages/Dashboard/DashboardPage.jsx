import { ArrowRight, BarChart3, BookOpen, Headphones, History, Mic, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardHeader from './components/DashboardHeader';

const practiceModules = [
  { title: 'Reading', description: 'Read passages and submit answers.', href: '/admin/features/reading', icon: BookOpen, style: 'bg-blue-100 text-blue-700' },
  { title: 'Listening', description: 'Practice with session-based exercises.', href: '/admin/features/listening', icon: Headphones, style: 'bg-rose-100 text-rose-700' },
  { title: 'Speaking', description: 'Record responses to active lessons.', href: '/admin/features/lesson', icon: Mic, style: 'bg-violet-100 text-violet-700' },
  { title: 'Writing', description: 'Submit a response for evaluation.', href: '/admin/features/writing', icon: PenLine, style: 'bg-emerald-100 text-emerald-700' },
];

const DashboardPage = () => (
  <div className="page-shell">
    <DashboardHeader />

    <section className="mt-8 rounded-xl border border-brand-200 bg-brand-50 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6" aria-labelledby="continue-heading">
      <div>
        <p className="text-sm font-semibold text-brand-700">Continue learning</p>
        <h2 id="continue-heading" className="mt-1 text-xl font-bold text-slate-950">Choose your next practice session</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Open the skills catalog to see the Reading, Listening, Speaking, and Writing activities currently available.</p>
      </div>
      <Link to="/admin/features" className="mt-4 inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 sm:mt-0">
        View practice skills <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>

    <section className="mt-10" aria-labelledby="skills-heading">
      <div className="mb-5">
        <h2 id="skills-heading" className="text-xl font-bold text-slate-950">IELTS skills</h2>
        <p className="mt-1 text-sm text-slate-600">Start with the area you want to improve today.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {practiceModules.map(({ title, description, href, icon: Icon, style }) => (
          <Link key={title} to={href} className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
            <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${style}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
            <h3 className="mt-4 font-bold text-slate-950">{title}</h3>
            <p className="mt-1 min-h-10 text-sm leading-5 text-slate-600">{description}</p>
            <span className="mt-4 inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-brand-700">Open practice <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
          </Link>
        ))}
      </div>
    </section>

    <section className="mt-10" aria-labelledby="review-heading">
      <div className="mb-5">
        <h2 id="review-heading" className="text-xl font-bold text-slate-950">Review saved progress</h2>
        <p className="mt-1 text-sm text-slate-600">Saved review tools currently use speaking results only.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/admin/features/speaking/history" className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-200">
          <span className="rounded-lg bg-violet-100 p-2.5 text-violet-700"><History className="h-5 w-5" aria-hidden="true" /></span>
          <span><strong className="block text-slate-950">Speaking history</strong><span className="mt-1 block text-sm leading-6 text-slate-600">Reopen saved attempts and detailed feedback.</span></span>
        </Link>
        <Link to="/admin/analytics" className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-200">
          <span className="rounded-lg bg-blue-100 p-2.5 text-blue-700"><BarChart3 className="h-5 w-5" aria-hidden="true" /></span>
          <span><strong className="block text-slate-950">Speaking analytics</strong><span className="mt-1 block text-sm leading-6 text-slate-600">See summaries calculated from saved speaking results.</span></span>
        </Link>
      </div>
    </section>

    <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">Listening progress is session-only and is not included in account history or analytics.</p>
  </div>
);

export default DashboardPage;
