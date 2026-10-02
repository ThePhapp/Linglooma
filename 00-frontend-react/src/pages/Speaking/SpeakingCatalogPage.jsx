import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, History, RefreshCw } from 'lucide-react';
import apiClient from '@/services/apiClient';
import CourseCard from './components/CourseCard';

const LessonSpeaking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState(searchParams.get('mode') === 'mock' ? 'mock' : 'practice');

  const loadLessons = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/api/lessons/all');
      const payload = Array.isArray(response) ? response : response?.data;
      setLessons(Array.isArray(payload) ? payload : []);
    } catch {
      setLessons([]);
      setError('Speaking lessons could not be loaded. Check the service and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, []);

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <span className="rounded-xl bg-brand-50 p-3"><BookOpen aria-hidden="true" className="h-7 w-7 text-brand-700" /></span>
              <div>
                <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">Speaking practice</h1>
                <p className="mt-1 text-slate-600">Choose from the active speaking topics currently available.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => navigate('/admin/features')} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"><ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back</button>
              <button type="button" onClick={() => navigate('/admin/features/speaking/history')} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"><History aria-hidden="true" className="h-4 w-4" /> Speaking history</button>
            </div>
          </div>
        </header>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2" aria-label="Speaking mode">
          {[['practice', 'Part 1 practice'], ['part2', 'Part 2 cue card'], ['mock', 'Speaking mock']].map(([value, label]) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)} className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold ${mode === value ? 'bg-brand-600 text-white' : 'border border-slate-300 bg-white text-slate-700'}`}>{label}</button>)}
        </div>

        {loading ? (
          <div aria-label="Loading speaking lessons" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map(item => <div key={item} className="h-96 animate-pulse rounded-2xl bg-white/80 shadow" />)}
          </div>
        ) : error ? (
          <section role="alert" className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-lg">
            <p className="text-lg font-semibold text-gray-900">{error}</p>
            <button type="button" onClick={loadLessons} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white hover:bg-purple-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-200"><RefreshCw aria-hidden="true" className="h-4 w-4" /> Try again</button>
          </section>
        ) : lessons.length === 0 ? (
          <section className="rounded-2xl bg-white p-12 text-center shadow-lg">
            <BookOpen aria-hidden="true" className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">No speaking lessons are available</h2>
            <p className="mt-2 text-gray-600">Check back after speaking content has been added.</p>
          </section>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {lessons.map((lesson) => (
              <CourseCard key={lesson.id} title={lesson.name} topic={lesson.difficulty || 'Speaking'} description={lesson.description} imageUrl={lesson.image} lessonId={lesson.id} mode={mode} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default LessonSpeaking;
