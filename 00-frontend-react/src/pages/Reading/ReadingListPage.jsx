import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Filter, RefreshCw, Search, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import Skeleton from '@/components/ui/Skeleton';
import StatePanel from '@/components/ui/StatePanel';
import apiClient from '@/services/apiClient';

const difficultyClasses = {
  easy: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  medium: 'border-amber-200 bg-amber-50 text-amber-900',
  hard: 'border-red-200 bg-red-50 text-red-800',
  academic: 'border-violet-200 bg-violet-50 text-violet-800',
};

const unwrapPassages = (response) => [response?.data?.data, response?.data, response].find(Array.isArray) ?? [];

const ReadingListPage = () => {
  const [passages, setPassages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');

  const fetchPassages = async () => {
    setLoading(true);
    setError('');
    try {
      setPassages(unwrapPassages(await apiClient.get('/api/reading')));
    } catch {
      setPassages([]);
      setError('Reading activities could not be loaded. Check the service and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPassages(); }, []);

  const topics = useMemo(() => [...new Set(passages.map(item => item.topic).filter(Boolean))].sort(), [passages]);
  const difficulties = useMemo(() => [...new Set(passages.map(item => item.difficulty).filter(Boolean))].sort(), [passages]);
  const filteredPassages = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return passages.filter(passage => {
      const searchable = [passage.title, passage.topic, passage.difficulty].filter(Boolean).join(' ').toLowerCase();
      return (!query || searchable.includes(query)) &&
        (selectedDifficulty === 'all' || passage.difficulty === selectedDifficulty) &&
        (selectedTopic === 'all' || passage.topic === selectedTopic);
    });
  }, [passages, searchTerm, selectedDifficulty, selectedTopic]);

  const hasFilters = Boolean(searchTerm) || selectedDifficulty !== 'all' || selectedTopic !== 'all';
  const clearFilters = () => { setSearchTerm(''); setSelectedDifficulty('all'); setSelectedTopic('all'); };

  return (
    <div className="page-shell">
      <PageHeader eyebrow="Reading" title="IELTS Reading Practice" description="Choose an available passage, read at a comfortable width, and answer every question before submitting." />

      <section aria-label="Filter reading activities" className="mt-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="relative">
          <Search aria-hidden="true" className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input aria-label="Search reading activities" type="search" placeholder="Search by title, topic, or difficulty" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} className="form-control pl-11 pr-11" />
          {searchTerm && <button type="button" aria-label="Clear search" onClick={() => setSearchTerm('')} className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"><X aria-hidden="true" className="h-4 w-4" /></button>}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_auto] lg:items-center">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><Filter aria-hidden="true" className="h-4 w-4" /> Filters</span>
          <select aria-label="Filter by difficulty" value={selectedDifficulty} onChange={event => setSelectedDifficulty(event.target.value)} className="form-control text-sm"><option value="all">All difficulties</option>{difficulties.map(value => <option key={value} value={value}>{value}</option>)}</select>
          <select aria-label="Filter by topic" value={selectedTopic} onChange={event => setSelectedTopic(event.target.value)} className="form-control text-sm"><option value="all">All topics</option>{topics.map(value => <option key={value} value={value}>{value}</option>)}</select>
          {hasFilters && <Button variant="ghost" size="small" onClick={clearFilters}>Clear filters</Button>}
        </div>
        {!loading && !error && <p className="mt-3 text-sm text-slate-500">Showing {filteredPassages.length} of {passages.length} passages</p>}
      </section>

      <div className="mt-6">
        {loading ? (
          <div aria-label="Loading reading activities" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map(item => <div key={item} className="rounded-xl border border-slate-200 bg-white p-5"><Skeleton className="h-11 w-11" /><Skeleton className="mt-5 h-6 w-3/4" /><Skeleton className="mt-3 h-4 w-full" /><Skeleton className="mt-2 h-4 w-2/3" /><Skeleton className="mt-6 h-11 w-full" /></div>)}</div>
        ) : error ? (
          <StatePanel tone="error" icon={<RefreshCw className="h-5 w-5" />} title="We couldn’t load reading practice" description={error} action={<Button onClick={fetchPassages}>Try again</Button>} />
        ) : filteredPassages.length === 0 ? (
          <StatePanel icon={<BookOpen className="h-5 w-5" />} title={hasFilters ? 'No matching passages' : 'No reading passages yet'} description={hasFilters ? 'Try a different search or clear the filters.' : 'Check back after reading content has been added.'} action={hasFilters ? <Button variant="secondary" onClick={clearFilters}>Clear filters</Button> : undefined} />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredPassages.map(passage => (
              <article key={passage.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-blue-700"><BookOpen className="h-5 w-5" aria-hidden="true" /></span>
                <div className="mt-4 flex flex-wrap gap-2">
                  {passage.difficulty && <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${difficultyClasses[passage.difficulty.toLowerCase()] || 'border-slate-200 bg-slate-50 text-slate-700'}`}>{passage.difficulty}</span>}
                  {passage.topic && <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">{passage.topic}</span>}
                </div>
                <h2 className="mt-4 flex-1 text-lg font-bold text-slate-950">{passage.title}</h2>
                <Link to={`/admin/features/reading/${passage.id}`} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">Start reading <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingListPage;
