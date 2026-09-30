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
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div aria-hidden="true" className="absolute left-10 top-20 h-72 w-72 rounded-full bg-blue-200 opacity-20 blur-xl" />
      <div aria-hidden="true" className="absolute right-10 top-40 h-72 w-72 rounded-full bg-purple-200 opacity-20 blur-xl" />
      <div className="container relative z-10 mx-auto px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-gray-700 shadow-md backdrop-blur-sm">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-green-500" />
              IELTS practice in one place
            </div>
            <h1 className="text-5xl font-bold leading-tight lg:text-6xl">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Practice English</span>
              <br />
              <span className="text-gray-800">with clear feedback</span>
            </h1>
            <p className="max-w-2xl text-xl leading-relaxed text-gray-600">
              Work through the Reading, Listening, Speaking, and Writing activities currently available in Linglooma. Saved progress and feedback vary by module.
            </p>
            <div className="flex flex-wrap gap-4">
              <button type="button" onClick={() => navigate('/register')} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-4 font-semibold text-white shadow-xl transition hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-300">
                Create an account <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => navigate('/login')} className="rounded-xl border-2 border-gray-200 bg-white/80 px-8 py-4 font-semibold text-gray-700 transition hover:border-purple-400 hover:text-purple-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-200">
                Sign in
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-2xl backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-gray-900">Choose how to practice</h2>
            <p className="mt-2 leading-6 text-gray-600">Create an account, then open a module from your dashboard.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {modules.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-purple-100 bg-gradient-to-br from-white to-purple-50 p-4">
                  <span className="rounded-xl bg-purple-100 p-3 text-purple-700"><Icon aria-hidden="true" className="h-5 w-5" /></span>
                  <span className="font-semibold text-gray-800">{label}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
              Listening progress is session-only. Saved analytics currently summarize speaking results only.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
