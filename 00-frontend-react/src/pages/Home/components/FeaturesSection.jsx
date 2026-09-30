import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Headphones, MessageSquare, PenTool, Sparkles, TrendingUp } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, iconStyle, href, linkLabel }) => (
  <article className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-brand-200 sm:p-6">
    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${iconStyle}`}>
      <Icon aria-hidden="true" className="h-6 w-6" />
    </div>
    <h3 className="mb-2 text-lg font-bold text-slate-950">{title}</h3>
    <p className="mb-5 text-sm leading-6 text-slate-600">{description}</p>
    <Link to={href} className="inline-flex min-h-11 items-center gap-2 rounded-md font-semibold text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
      {linkLabel}<ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  </article>
);

const features = [
  { icon: BookOpen, title: 'Reading Practice', description: 'Practice with the reading passages available in Linglooma.', href: '/admin/features/reading', linkLabel: 'Start reading', iconStyle: 'bg-blue-100 text-blue-700' },
  { icon: Headphones, title: 'Listening Practice', description: 'Try the available listening exercises. Your listening progress is session-only.', href: '/admin/features/listening', linkLabel: 'Start listening', iconStyle: 'bg-rose-100 text-rose-700' },
  { icon: MessageSquare, title: 'Speaking Practice', description: 'Browse speaking lessons and practice available responses.', href: '/admin/features', linkLabel: 'Start speaking', iconStyle: 'bg-violet-100 text-violet-700' },
  { icon: PenTool, title: 'Writing Practice', description: 'Submit writing responses for evaluation and feedback.', href: '/admin/features/writing', linkLabel: 'Start writing', iconStyle: 'bg-emerald-100 text-emerald-700' },
  { icon: TrendingUp, title: 'Speaking Analytics', description: 'Review summaries based on your saved speaking results only.', href: '/admin/analytics', linkLabel: 'View analytics', iconStyle: 'bg-amber-100 text-amber-700' },
];

const FeaturesSection = () => (
  <section className="bg-slate-50 py-14 sm:py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-3xl sm:mb-12">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1.5">
          <Sparkles aria-hidden="true" className="h-4 w-4 text-brand-700" />
          <span className="text-sm font-semibold text-brand-700">Practice tools</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Practice every IELTS skill</h2>
        <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">Choose a module to explore the practice activities currently available.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
