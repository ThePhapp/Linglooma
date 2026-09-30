import { useEffect, useState } from 'react';
import { History, LogOut, Mic, RefreshCw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import apiClient from '@/services/apiClient';

const SpeakingGrid = ({ setCurrentQuestion, setCurrentIndex }) => {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [lessonTitle, setLessonTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const selectQuestion = index => {
    const question = questions[index];
    if (!question) return;
    setActiveIndex(index);
    setCurrentQuestion(question);
    setCurrentIndex(index);
  };

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiClient.get(`/api/questions/${lessonId}`);
      if (!Array.isArray(data?.questions)) throw new Error(data?.message || 'No questions were returned for this lesson.');
      setQuestions(data.questions);
      if (data.questions.length) {
        setCurrentQuestion(data.questions[0]);
        setCurrentIndex(0);
        setActiveIndex(0);
        setLessonTitle(data.questions[0].name || 'Speaking lesson');
      }
    } catch (requestError) {
      setQuestions([]);
      setCurrentQuestion(null);
      setError(requestError?.response?.data?.message || requestError.message || 'Questions could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, [lessonId]);

  return (
    <section className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="questions-heading">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700"><Mic className="h-5 w-5" aria-hidden="true" /></span>
        <div><h2 id="questions-heading" className="text-xl font-bold text-slate-950">Questions</h2><p className="mt-1 text-sm text-slate-600">Lesson {lessonId}{lessonTitle ? ` · ${lessonTitle}` : ''}</p></div>
      </div>

      {loading ? (
        <div className="mt-6 grid grid-cols-4 gap-3" aria-label="Loading speaking questions">{[0, 1, 2, 3, 4, 5, 6, 7].map(item => <Skeleton key={item} className="aspect-square" />)}</div>
      ) : error ? (
        <div role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p>{error}</p><Button size="small" onClick={fetchQuestions} className="mt-3"><RefreshCw className="h-4 w-4" /> Try again</Button></div>
      ) : questions.length === 0 ? (
        <p className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">No questions are available for this lesson.</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-3">
            {questions.map((question, index) => (
              <button key={question.id ?? index} type="button" onClick={() => selectQuestion(index)} aria-pressed={activeIndex === index} aria-label={`Select question ${index + 1}`} className={`flex aspect-square min-h-11 items-center justify-center rounded-lg border text-base font-bold transition-colors ${activeIndex === index ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50'}`}>{index + 1}</button>
            ))}
          </div>
          <div className="mt-5">
            <div className="flex justify-between text-xs text-slate-500"><span>Question progress</span><span>{activeIndex + 1} of {questions.length}</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-brand-600 transition-[width]" style={{ width: `${((activeIndex + 1) / questions.length) * 100}%` }} /></div>
          </div>
        </>
      )}

      <div className="mt-6 grid gap-3 border-t border-slate-200 pt-5">
        <Button variant="secondary" onClick={() => navigate('/admin/features/speaking/history')}><History className="h-4 w-4" aria-hidden="true" /> View history</Button>
        <Button variant="ghost" onClick={() => navigate('/admin/features/lesson')}><LogOut className="h-4 w-4" aria-hidden="true" /> Exit lesson</Button>
      </div>
    </section>
  );
};

export default SpeakingGrid;
