import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Headphones, Mic, PenLine } from 'lucide-react';

const modules = [
  { icon: BookOpen, label: 'Reading passages' },
  { icon: Headphones, label: 'Listening exercises' },
  { icon: Mic, label: 'Speaking practice' },
  { icon: PenLine, label: 'Writing evaluation' },
];

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="min-w-0 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500" />
              IELTS practice in one place
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Build IELTS skills with <span className="text-brand-700">clear feedback</span>
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Work through the Reading, Listening, Speaking, and Writing activities currently available in Linglooma. Saved progress and feedback vary by module.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => navigate('/register')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                Create an account <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => navigate('/login')} className="min-h-12 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                Sign in
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">Choose how to practice</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">Create an account, then open a module from your dashboard.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {modules.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                  <span className="rounded-lg bg-brand-100 p-2.5 text-brand-700"><Icon aria-hidden="true" className="h-5 w-5" /></span>
                  <span className="text-sm font-semibold text-slate-800">{label}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
              Listening progress is session-only. Saved analytics currently summarize speaking results only.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
