import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Filter, RefreshCw, Search, X } from 'lucide-react';
import apiClient from '@/services/apiClient';

const difficultyClasses = {
  easy: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-amber-100 text-amber-900 border-amber-200',
  hard: 'bg-red-100 text-red-800 border-red-200',
  academic: 'bg-purple-100 text-purple-800 border-purple-200',
};

const topicIcons = {
  Environment: '🌍', Technology: '💻', History: '📜', Lifestyle: '🌱',
  Science: '🔬', Culture: '🎭', Psychology: '🧠', Architecture: '🏛️',
  Health: '❤️', Economics: '💰',
};

function unwrapPassages(response) {
  const candidates = [response?.data?.data, response?.data, response];
  return candidates.find(Array.isArray) ?? [];
}

const ReadingList = () => {
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
      const response = await apiClient.get('/api/reading');
      setPassages(unwrapPassages(response));
    } catch {
      setPassages([]);
      setError('Reading activities could not be loaded. Check the service and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassages();
  }, []);

  const topics = useMemo(
    () => [...new Set(passages.map(passage => passage.topic).filter(Boolean))].sort(),
    [passages]
  );
  const difficulties = useMemo(
    () => [...new Set(passages.map(passage => passage.difficulty).filter(Boolean))].sort(),
    [passages]
  );
  const filteredPassages = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return passages.filter(passage => {
      const searchable = [passage.title, passage.topic, passage.difficulty]
        .filter(Boolean).join(' ').toLowerCase();
      return (!query || searchable.includes(query)) &&
        (selectedDifficulty === 'all' || passage.difficulty === selectedDifficulty) &&
        (selectedTopic === 'all' || passage.topic === selectedTopic);
    });
  }, [passages, searchTerm, selectedDifficulty, selectedTopic]);

  const hasFilters = Boolean(searchTerm) || selectedDifficulty !== 'all' || selectedTopic !== 'all';
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDifficulty('all');
    setSelectedTopic('all');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-2xl bg-gradient-to-r from-blue-700 via-cyan-700 to-teal-600 p-6 text-white shadow-xl sm:p-8">
          <div className="flex items-center gap-4">
            <span className="rounded-xl bg-white/15 p-3"><BookOpen aria-hidden="true" className="h-8 w-8" /></span>
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">IELTS Reading Practice</h1>
              <p className="mt-2 text-white/90">Choose from the reading passages currently available.</p>
            </div>
          </div>
          {!loading && !error && <p className="mt-6 text-sm font-semibold text-white/90">{passages.length} available {passages.length === 1 ? 'passage' : 'passages'}</p>}
        </header>

        <section aria-label="Filter reading activities" className="my-8 rounded-2xl bg-white/90 p-5 shadow-lg">
          <div className="relative">
            <Search aria-hidden="true" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input aria-label="Search reading activities" type="search" placeholder="Search by title, topic, or difficulty" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} className="w-full rounded-xl border-2 border-gray-200 py-3 pl-12 pr-11 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            {searchTerm && <button type="button" aria-label="Clear search" onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 rounded text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><X aria-hidden="true" className="h-5 w-5" /></button>}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700"><Filter aria-hidden="true" className="h-4 w-4" /> Filters</span>
            <select aria-label="Filter by difficulty" value={selectedDifficulty} onChange={event => setSelectedDifficulty(event.target.value)} className="rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              <option value="all">All difficulties</option>
              {difficulties.map(difficulty => <option key={difficulty} value={difficulty}>{difficulty}</option>)}
            </select>
            <select aria-label="Filter by topic" value={selectedTopic} onChange={event => setSelectedTopic(event.target.value)} className="rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              <option value="all">All topics</option>
              {topics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
            </select>
            {hasFilters && <button type="button" onClick={clearFilters} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Clear filters</button>}
            {!loading && !error && <span className="ml-auto text-sm text-gray-600">Showing {filteredPassages.length} of {passages.length}</span>}
          </div>
        </section>

        {loading ? (
          <div aria-label="Loading reading activities" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map(item => <div key={item} className="h-64 animate-pulse rounded-2xl bg-white/80 shadow" />)}
          </div>
        ) : error ? (
          <section role="alert" className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-lg">
            <p className="text-lg font-semibold text-gray-900">{error}</p>
            <button type="button" onClick={fetchPassages} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"><RefreshCw aria-hidden="true" className="h-4 w-4" /> Try again</button>
          </section>
        ) : filteredPassages.length === 0 ? (
          <section className="rounded-2xl bg-white p-12 text-center shadow-lg">
            <BookOpen aria-hidden="true" className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">{hasFilters ? 'No matching passages' : 'No reading passages are available'}</h2>
            <p className="mt-2 text-gray-600">{hasFilters ? 'Try a different search or clear the filters.' : 'Check back after reading content has been added.'}</p>
            {hasFilters && <button type="button" onClick={clearFilters} className="mt-5 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200">Clear filters</button>}
          </section>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPassages.map(passage => (
              <article key={passage.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white/90 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
                {passage.image ? <img src={passage.image} alt="" className="h-44 w-full object-cover" /> : <div aria-hidden="true" className="flex h-44 items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 text-6xl">{topicIcons[passage.topic] || '📖'}</div>}
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {passage.difficulty && <span className={`rounded-full border px-3 py-1 text-xs font-bold ${difficultyClasses[passage.difficulty.toLowerCase()] || 'border-gray-200 bg-gray-100 text-gray-700'}`}>{passage.difficulty}</span>}
                    {passage.topic && <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">{topicIcons[passage.topic] || '📖'} {passage.topic}</span>}
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-gray-900">{passage.title}</h2>
                  <Link to={`/admin/features/reading/${passage.id}`} className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-700 to-cyan-700 px-4 py-3 font-bold text-white hover:from-blue-800 hover:to-cyan-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200">Start reading</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default ReadingList;
