import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Bookmark, Clock, Edit3, FileText, Filter, History, RefreshCw, Search, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import Skeleton from '@/components/ui/Skeleton';
import StatePanel from '@/components/ui/StatePanel';
import apiClient from '@/services/apiClient';

const unwrapPrompts = (response) => [response?.data?.data, response?.data, response].find(Array.isArray) ?? [];
const difficultyStyles = { Easy: 'bg-emerald-50 text-emerald-800 border-emerald-200', Medium: 'bg-amber-50 text-amber-900 border-amber-200', Hard: 'bg-red-50 text-red-800 border-red-200' };

const WritingListPage = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [taskType, setTaskType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [topic, setTopic] = useState('all');
  const [saved, setSaved] = useState({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examMode = searchParams.get('mode') === 'exam';

  const fetchPrompts = async () => {
    setLoading(true);
    setError('');
    try { setPrompts(unwrapPrompts(await apiClient.get('/api/writing'))); }
    catch { setPrompts([]); setError('Writing prompts could not be loaded. Check the service and try again.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPrompts(); }, []);

  const topics = useMemo(() => [...new Set(prompts.map(item => item.topic).filter(Boolean))].sort(), [prompts]);
  const difficulties = useMemo(() => [...new Set(prompts.map(item => item.difficulty).filter(Boolean))].sort(), [prompts]);
  const filteredPrompts = useMemo(() => prompts.filter(prompt => {
    const query = searchTerm.trim().toLowerCase();
    const searchable = [prompt.title, prompt.prompt_text, prompt.topic].filter(Boolean).join(' ').toLowerCase();
    return (!query || searchable.includes(query)) && (taskType === 'all' || prompt.task_type === taskType) && (difficulty === 'all' || prompt.difficulty === difficulty) && (topic === 'all' || prompt.topic === topic);
  }), [prompts, searchTerm, taskType, difficulty, topic]);

  const hasFilters = Boolean(searchTerm) || taskType !== 'all' || difficulty !== 'all' || topic !== 'all';
  const clearFilters = () => { setSearchTerm(''); setTaskType('all'); setDifficulty('all'); setTopic('all'); };

  return (
    <div className="page-shell">
      <PageHeader eyebrow="Writing" title="IELTS Writing Practice" description="Choose an available task, write in a focused editor, and submit your response for evaluation." actions={<Button variant="secondary" onClick={() => navigate('/admin/features/writing/history')}><History className="h-4 w-4" aria-hidden="true" /> History</Button>} />

      <section aria-label="Filter writing prompts" className="mt-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input type="search" aria-label="Search writing prompts" placeholder="Search by title, topic, or prompt" className="form-control pl-11 pr-11" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} />
          {searchTerm && <button type="button" aria-label="Clear search" onClick={() => setSearchTerm('')} className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_1fr_auto] lg:items-center">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><Filter className="h-4 w-4" aria-hidden="true" /> Filters</span>
          <select aria-label="Filter by task type" className="form-control text-sm" value={taskType} onChange={event => setTaskType(event.target.value)}><option value="all">All task types</option><option value="Task 1">Task 1</option><option value="Task 2">Task 2</option></select>
          <select aria-label="Filter by difficulty" className="form-control text-sm" value={difficulty} onChange={event => setDifficulty(event.target.value)}><option value="all">All difficulties</option>{difficulties.map(value => <option key={value} value={value}>{value}</option>)}</select>
          <select aria-label="Filter by topic" className="form-control text-sm" value={topic} onChange={event => setTopic(event.target.value)}><option value="all">All topics</option>{topics.map(value => <option key={value} value={value}>{value}</option>)}</select>
          {hasFilters && <Button variant="ghost" size="small" onClick={clearFilters}>Clear filters</Button>}
        </div>
        {!loading && !error && <p className="mt-3 text-sm text-slate-500">Showing {filteredPrompts.length} of {prompts.length} writing tasks</p>}
      </section>

      <div className="mt-6">
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-label="Loading writing prompts">{[0, 1, 2, 3, 4, 5].map(item => <div key={item} className="rounded-xl border border-slate-200 bg-white p-5"><Skeleton className="h-11 w-11" /><Skeleton className="mt-5 h-6 w-2/3" /><Skeleton className="mt-3 h-4 w-full" /><Skeleton className="mt-2 h-4 w-4/5" /><Skeleton className="mt-6 h-11 w-full" /></div>)}</div>
        ) : error ? (
          <StatePanel tone="error" icon={<RefreshCw className="h-5 w-5" />} title="We couldn’t load writing practice" description={error} action={<Button onClick={fetchPrompts}>Try again</Button>} />
        ) : filteredPrompts.length === 0 ? (
          <StatePanel icon={<FileText className="h-5 w-5" />} title={hasFilters ? 'No matching writing tasks' : 'No writing tasks yet'} description={hasFilters ? 'Try different filters or clear your search.' : 'Check back after writing content has been added.'} action={hasFilters ? <Button variant="secondary" onClick={clearFilters}>Clear filters</Button> : undefined} />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrompts.map(prompt => (
              <article key={prompt.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><Edit3 className="h-5 w-5" aria-hidden="true" /></span>{prompt.task_type && <span className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800">{prompt.task_type}</span>}</div>
                <h2 className="mt-4 line-clamp-2 text-lg font-bold text-slate-950">{prompt.title}</h2>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">{prompt.prompt_text}</p>
                <div className="mt-4 flex flex-wrap gap-2">{prompt.difficulty && <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${difficultyStyles[prompt.difficulty] || 'border-slate-200 bg-slate-50 text-slate-700'}`}>{prompt.difficulty}</span>}{prompt.topic && <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">{prompt.topic}</span>}</div>
                <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 p-3 text-xs text-slate-600"><span className="inline-flex items-center gap-1.5"><Edit3 className="h-3.5 w-3.5" /> Min {prompt.word_limit} words</span><span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {prompt.time_limit} min</span></div>
                <div className="mt-5 flex gap-2"><button type="button" onClick={() => navigate(`/admin/features/writing/${prompt.id}${examMode ? '?mode=exam' : ''}`)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">{examMode ? 'Start mock' : 'Start writing'} <ArrowRight className="h-4 w-4" aria-hidden="true" /></button><button type="button" onClick={() => savePrompt(prompt)} className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50" aria-label={`Save ${prompt.title}`}><Bookmark className={`h-4 w-4 ${saved[prompt.id] ? 'fill-brand-600 text-brand-600' : ''}`} /></button></div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WritingListPage;
  const savePrompt = async prompt => {
    await apiClient.post('/api/learning/bookmarks', { itemType: 'writing', sourceId: prompt.id, title: prompt.title, href: `/admin/features/writing/${prompt.id}` });
    setSaved(value => ({ ...value, [prompt.id]: true }));
  };
