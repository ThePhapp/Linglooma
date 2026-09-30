import { BookOpen, Headphones, Mic, PenLine } from 'lucide-react';
import { PracticeCard } from './components/PracticeCard';
import SkillsHeader from './components/SkillsHeader';

const modules = [
  { title: 'Listening Practice', icon: Headphones, iconStyle: 'bg-rose-100 text-rose-700', description: 'Use the listening exercises currently available. Progress in this module is session-only.', href: '/admin/features/listening' },
  { title: 'Speaking Practice', icon: Mic, iconStyle: 'bg-violet-100 text-violet-700', description: 'Choose an active speaking lesson, record a response, and review saved results.', href: '/admin/features/lesson' },
  { title: 'Reading Practice', icon: BookOpen, iconStyle: 'bg-blue-100 text-blue-700', description: 'Choose an active reading passage and submit answers for scoring.', href: '/admin/features/reading' },
  { title: 'Writing Practice', icon: PenLine, iconStyle: 'bg-emerald-100 text-emerald-700', description: 'Choose an active writing prompt and submit a response for evaluation.', href: '/admin/features/writing' },
];

const SkillsPage = () => (
  <div className="page-shell">
    <SkillsHeader />
    <div className="mt-8 grid gap-5 md:grid-cols-2">
      {modules.map(module => <PracticeCard key={module.title} {...module} />)}
    </div>
  </div>
);

export default SkillsPage;
