import React, { useCallback, useEffect, useState } from 'react';
import apiClient from "@/services/apiClient";
import { Link } from 'react-router-dom';
import { Activity, BookOpen, Clock, RefreshCw, TrendingUp, Trophy } from 'lucide-react';

const normalizeResults = (response) => {
  const data = Array.isArray(response) ? response : response?.results;
  if (!Array.isArray(data)) return [];

  return data
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => {
      const parsedScore = Number(item.ielts_band ?? item.averageScore);
      const parsedQuestions = Number(item.question_count ?? item.questionCount);
      const timestamp = item.completed_at ?? item.created_at ?? item.date;
      return {
        id: item.id ?? item.result_id ?? `${item.lesson_id ?? 'session'}-${timestamp ?? index}`,
        title: item.lesson_title ?? item.title ?? (item.lesson_id ? `Lesson ${item.lesson_id}` : 'Speaking practice'),
        score: Number.isFinite(parsedScore) && parsedScore > 0 ? parsedScore : null,
        questions: Number.isFinite(parsedQuestions) && parsedQuestions > 0 ? parsedQuestions : 0,
        date: timestamp && !Number.isNaN(Date.parse(timestamp)) ? new Date(timestamp) : null
      };
    });
};

const SmartAnalytics = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await apiClient.get('/api/lessons/results/history');
      setResults(normalizeResults(response));
    } catch (fetchError) {
      console.error('Failed to fetch speaking analytics:', fetchError);
      setResults([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const scoredResults = results.filter((result) => result.score !== null);
  const averageScore = scoredResults.length
    ? (scoredResults.reduce((sum, result) => sum + result.score, 0) / scoredResults.length).toFixed(1)
    : null;
  const bestScore = scoredResults.length ? Math.max(...scoredResults.map((result) => result.score)).toFixed(1) : null;
  const totalQuestions = results.reduce((sum, result) => sum + result.questions, 0);

  return (
    <main className="page-shell">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 sm:h-14 sm:w-14">
                <Activity className="h-7 w-7 text-brand-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">Speaking analytics</h1>
                <p className="mt-1 text-slate-600">Track your speaking practice progress</p>
              </div>
            </div>
            <div className="rounded-xl bg-brand-50 px-6 py-4 text-center">
              <p className="mb-1 text-sm text-brand-700">Average band score</p>
              <p className="text-4xl font-bold text-brand-700">{averageScore ?? '—'}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div role="status" className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-700">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
            Loading your speaking analytics…
          </div>
        ) : error ? (
          <div role="alert" className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Analytics couldn’t be loaded</h2>
            <p className="text-gray-600 mb-6">Please check your connection and try again.</p>
            <button
              type="button"
              onClick={fetchResults}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
            >
              <RefreshCw className="h-5 w-5" /> Retry
            </button>
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-brand-600" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No speaking practice yet</h2>
            <p className="text-gray-600 mb-6">Complete a speaking session and your results will appear here.</p>
            <Link
              to="/admin/features/lesson"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
            >
              Start practicing <TrendingUp className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-gray-600 text-sm mb-1">Average Band</p>
                <p className="text-4xl font-bold text-brand-700">{averageScore ?? '—'}</p>
                <p className="mt-3 text-sm text-gray-500">Across scored sessions</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1"><Trophy className="h-4 w-4" /> Best Band</div>
                <p className="text-4xl font-bold text-blue-600">{bestScore ?? '—'}</p>
                <p className="mt-3 text-sm text-gray-500">From your completed sessions</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1"><Clock className="h-4 w-4" /> Practice Sessions</div>
                <p className="text-4xl font-bold text-green-600">{results.length}</p>
                <p className="mt-3 text-sm text-gray-500">{totalQuestions} questions answered</p>
              </div>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Speaking practice history</h2>
              <div className="space-y-3">
                {results.map((result) => (
                  <div key={result.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">{result.title}</h3>
                      <p className="text-sm text-gray-500">
                        {result.date ? result.date.toLocaleString() : 'Date unavailable'}
                        {result.questions ? ` · ${result.questions} questions` : ''}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-brand-700">
                      {result.score !== null ? `${result.score.toFixed(1)} band` : 'Score pending'}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default SmartAnalytics;
