import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/services/apiClient';

const SpeakingHistory = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchSpeakingHistory = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get('/api/lessons/results/history');
      if (!Array.isArray(data)) throw new Error('Invalid speaking history response');

      setResults(data.map((result) => {
        const score = Number(result.ielts_band);
        const questionCount = Number(result.question_count);
        return {
          ...result,
          ielts_band: Number.isFinite(score) && score > 0 ? score : null,
          question_count: Number.isFinite(questionCount) && questionCount > 0 ? questionCount : 0
        };
      }));
    } catch (err) {
      console.error('❌ Error fetching speaking history:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Speaking history could not be loaded.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchSpeakingHistory();
  }, [fetchSpeakingHistory]);

  const getScoreColor = (score) => {
    if (!score) return 'text-gray-500';
    if (score >= 7) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (!score) return 'bg-gray-100';
    if (score >= 7) return 'bg-green-50';
    if (score >= 6) return 'bg-yellow-50';
    if (score >= 5) return 'bg-orange-50';
    return 'bg-red-50';
  };

  const getLevelLabel = (score) => {
    if (!score || score <= 0) return 'Pending';
    if (score >= 8) return 'Proficient';
    if (score >= 6.5) return 'Upper Intermediate';
    if (score >= 5) return 'Intermediate';
    if (score >= 3) return 'Elementary';
    return 'Beginner';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (!dateString || Number.isNaN(date.getTime())) return 'Date unavailable';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetail = (lessonResultId) => {
    navigate(`/admin/features/feedback/${lessonResultId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading speaking history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="flex flex-col gap-4 items-center justify-center min-h-screen px-4 text-center">
        <div className="text-xl text-red-600">{error}</div>
        <button
          type="button"
          onClick={fetchSpeakingHistory}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Speaking Practice History</h1>
        <p className="text-gray-600">Review your past speaking sessions and track your progress</p>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/features/lesson')}
        className="mb-6 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
      >
        ← Back to Lessons
      </button>

      {/* Results List */}
      {results.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-xl text-gray-500 mb-4">No speaking practice sessions yet</p>
          <button
            onClick={() => navigate('/admin/features/lesson')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Start Practicing
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {results.map((result) => (
            <div
              key={result.id}
              className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden ${getScoreBgColor(result.ielts_band)}`}
            >
              <div className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-4">
                  {/* Lesson Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {result.lesson_title || `Lesson ${result.lesson_id}`}
                    </h3>
                    <div className="flex flex-wrap gap-3 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                        {result.question_count || 0} Questions
                      </span>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        result.ielts_band >= 6.5 ? 'bg-green-100 text-green-800' : 
                        result.ielts_band >= 5 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {getLevelLabel(result.ielts_band)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span>📅 {formatDate(result.completed_at || result.created_at)}</span>
                    </div>
                  </div>

                  {/* Band Score */}
                  <div className="sm:ml-4 text-center">
                    {result.ielts_band ? (
                      <>
                        <div className={`text-5xl font-bold ${getScoreColor(result.ielts_band)}`}>
                          {result.ielts_band.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-500">IELTS Band</div>
                      </>
                    ) : (
                      <div className="text-gray-500">
                        <div className="text-3xl">⏳</div>
                        <div className="text-sm">Pending</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Score Details */}
                {result.accuracy_score || result.fluency_score || result.completeness_score ? (
                  <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-white bg-opacity-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {result.accuracy_score || 0}
                      </div>
                      <div className="text-xs text-gray-600">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {result.fluency_score || 0}
                      </div>
                      <div className="text-xs text-gray-600">Fluency</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {result.completeness_score || 0}
                      </div>
                      <div className="text-xs text-gray-600">Completeness</div>
                    </div>
                  </div>
                ) : null}

                {/* View Detail Button */}
                <button
                  onClick={() => handleViewDetail(result.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                    View Detailed Feedback
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistics Summary */}
      {results.length > 0 && (
        <div className="mt-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">📈 Your Progress</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{results.length}</div>
              <div className="text-sm opacity-90">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {(results.reduce((sum, r) => sum + (r.ielts_band || 0), 0) / results.filter(r => r.ielts_band).length || 0).toFixed(1)}
              </div>
              <div className="text-sm opacity-90">Average Band</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {Math.max(...results.map(r => r.ielts_band || 0)).toFixed(1)}
              </div>
              <div className="text-sm opacity-90">Best Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {results.reduce((sum, r) => sum + (r.question_count || 0), 0)}
              </div>
              <div className="text-sm opacity-90">Questions Answered</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeakingHistory;
