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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Smart Analytics Dashboard</h1>
                <p className="text-white/90 text-lg">Track your speaking practice progress</p>
              </div>
            </div>
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
              <p className="text-white/80 text-sm mb-1">Average Band Score</p>
              <p className="text-5xl font-bold text-white">{averageScore ?? '—'}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div role="status" className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center text-gray-700">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4" />
            Loading your speaking analytics…
          </div>
        ) : error ? (
          <div role="alert" className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Analytics couldn’t be loaded</h2>
            <p className="text-gray-600 mb-6">Please check your connection and try again.</p>
            <button
              type="button"
              onClick={fetchResults}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition"
            >
              <RefreshCw className="h-5 w-5" /> Retry
            </button>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-10 text-center">
            <BookOpen className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No speaking practice yet</h2>
            <p className="text-gray-600 mb-6">Complete a speaking session and your results will appear here.</p>
            <Link
              to="/admin/features/lesson"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition"
            >
              Start practicing <TrendingUp className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-purple-200">
                <p className="text-gray-600 text-sm mb-1">Average Band</p>
                <p className="text-4xl font-bold text-purple-600">{averageScore ?? '—'}</p>
                <p className="mt-3 text-sm text-gray-500">Across scored sessions</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-blue-200">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1"><Trophy className="h-4 w-4" /> Best Band</div>
                <p className="text-4xl font-bold text-blue-600">{bestScore ?? '—'}</p>
                <p className="mt-3 text-sm text-gray-500">From your completed sessions</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1"><Clock className="h-4 w-4" /> Practice Sessions</div>
                <p className="text-4xl font-bold text-green-600">{results.length}</p>
                <p className="mt-3 text-sm text-gray-500">{totalQuestions} questions answered</p>
              </div>
            </div>

            <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-purple-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Speaking practice history</h2>
              <div className="space-y-3">
                {results.map((result) => (
                  <div key={result.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-purple-100 bg-white/70 p-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">{result.title}</h3>
                      <p className="text-sm text-gray-500">
                        {result.date ? result.date.toLocaleString() : 'Date unavailable'}
                        {result.questions ? ` · ${result.questions} questions` : ''}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {result.score !== null ? `${result.score.toFixed(1)} band` : 'Score pending'}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartAnalytics;
