import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, History, RefreshCw } from 'lucide-react';
import apiClient from '@/services/apiClient';
import CourseCard from './components/CourseCard';

const gradients = [
  'from-blue-500 to-cyan-600',
  'from-green-500 to-emerald-600',
  'from-purple-500 to-violet-600',
  'from-pink-500 to-rose-600',
  'from-orange-500 to-amber-600',
  'from-red-500 to-pink-600',
];

const LessonSpeaking = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-2xl bg-gradient-to-r from-purple-700 via-pink-700 to-rose-600 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <span className="rounded-xl bg-white/15 p-3"><BookOpen aria-hidden="true" className="h-8 w-8" /></span>
              <div>
                <h1 className="text-3xl font-bold">Speaking Practice Lessons</h1>
                <p className="mt-1 text-white/90">Choose from the active speaking topics currently available.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => navigate('/admin/features')} className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-3 text-sm font-semibold hover:bg-white/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"><ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back</button>
              <button type="button" onClick={() => navigate('/admin/features/speaking/history')} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-purple-700 hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"><History aria-hidden="true" className="h-4 w-4" /> Speaking history</button>
            </div>
          </div>
        </header>

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
            {lessons.map((lesson, index) => (
              <CourseCard key={lesson.id} title={lesson.name} topic={lesson.difficulty || 'Speaking'} description={lesson.description} imageUrl={lesson.image} lessonId={lesson.id} gradient={gradients[index % gradients.length]} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default LessonSpeaking;
