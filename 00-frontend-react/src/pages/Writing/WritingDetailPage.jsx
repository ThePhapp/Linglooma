import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '@/services/apiClient';

const WritingDetail = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDetail();
  }, [submissionId]);

  const fetchDetail = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(`/api/writing/submissions/${submissionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Normalize response
      const payload = response?.data ?? response;
      const detailObj = payload?.data ?? payload;
      if (detailObj) {
        setDetail(detailObj);
      } else {
        setError('Failed to load submission detail');
      }
    } catch (err) {
      console.error('Error fetching submission detail:', err);
      if (err.response?.status === 401) {
        alert('Session expired. Please login again.');
        navigate('/login');
      } else if (err.response?.status === 404) {
        setError('Submission not found or access denied');
      } else {
        setError('Could not connect to server');
      }
    } finally {
      setLoading(false);
    }
  };

  const getBandColor = (band) => {
    if (!band) return 'text-gray-500';
    if (band >= 7) return 'text-green-600';
    if (band >= 6) return 'text-yellow-600';
    if (band >= 5) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading submission detail...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Submission not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{detail.title}</h1>
          <div className="flex gap-3 mb-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
              {detail.task_type}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
              {detail.topic}
            </span>
          </div>
          <p className="text-gray-600">Submitted: {formatDate(detail.submitted_at)}</p>
          {detail.evaluated_at && (
            <p className="text-gray-600">Evaluated: {formatDate(detail.evaluated_at)}</p>
          )}
        </div>

        {/* Prompt */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Original Prompt:</h3>
          <p className="text-gray-700 whitespace-pre-line">{detail.prompt_text}</p>
          <div className="mt-2 text-sm text-gray-600">
            Required: Minimum {detail.word_limit} words
          </div>
        </div>

        {/* Student's Essay */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Your Essay ({detail.word_count} words)</h3>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-800 whitespace-pre-line leading-relaxed">{detail.essay_text}</p>
          </div>
        </div>

        {/* Evaluation Results */}
        {detail.overall_band && (
          <>
            {/* Overall Band Score */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-6">
              <div className="text-center">
                <p className="text-lg mb-2">Overall Band Score</p>
                <p className="text-6xl font-bold">{detail.overall_band}</p>
              </div>
            </div>

            {/* Individual Scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Task Achievement</p>
                <p className={`text-3xl font-bold ${getBandColor(detail.task_achievement)}`}>
                  {detail.task_achievement}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Coherence & Cohesion</p>
                <p className={`text-3xl font-bold ${getBandColor(detail.coherence_cohesion)}`}>
                  {detail.coherence_cohesion}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Lexical Resource</p>
                <p className={`text-3xl font-bold ${getBandColor(detail.lexical_resource)}`}>
                  {detail.lexical_resource}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Grammar Accuracy</p>
                <p className={`text-3xl font-bold ${getBandColor(detail.grammar_accuracy)}`}>
                  {detail.grammar_accuracy}
                </p>
              </div>
            </div>

            {/* Overall Feedback */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Overall Feedback</h3>
              <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">{detail.overall_feedback}</p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-green-700">Strengths</h3>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">{detail.strengths}</p>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-red-700">Areas to Improve</h3>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">{detail.weaknesses}</p>
                </div>
              </div>
            </div>

            {/* Grammar Errors */}
            {detail.grammar_errors && detail.grammar_errors.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">📝 Grammar Errors & Corrections</h3>
                <div className="space-y-3">
                  {detail.grammar_errors.map((error, index) => (
                    <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                      <p className="text-red-600 font-medium mb-1">❌ {error.error}</p>
                      <p className="text-green-600 font-medium mb-2">✅ {error.correction}</p>
                      <p className="text-gray-600 text-sm">{error.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vocabulary Suggestions */}
            {detail.vocabulary_suggestions && detail.vocabulary_suggestions.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">💡  Enhancements</h3>
                <div className="space-y-3">
                  {detail.vocabulary_suggestions.map((vocab, index) => (
                    <div key={index} className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded">
                      <p className="font-medium mb-1">
                        <span className="text-gray-600">Instead of:</span> <span className="text-red-600">{vocab.word}</span>
                        <span className="mx-2">→</span>
                        <span className="text-gray-600">Use:</span> <span className="text-green-600">{vocab.suggestion}</span>
                      </p>
                      <p className="text-gray-600 text-sm italic">Example: {vocab.context}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Structure Feedback */}
            {detail.structure_feedback && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">🏗️ Structure & Organization</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-line">
                  {detail.structure_feedback}
                </p>
              </div>
            )}

            {/* Improvement Tips */}
            {detail.improvement_tips && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">💪 Tips for Improvement</h3>
                <p className="text-gray-700 bg-blue-50 p-4 rounded-lg whitespace-pre-line">
                  {detail.improvement_tips}
                </p>
              </div>
            )}
          </>
        )}

        {!detail.overall_band && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-2xl mb-2">⏳</p>
            <p>This essay is still being evaluated...</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/admin/features/writing/history')}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            ← Back to History
          </button>
          <button
            onClick={() => navigate('/admin/features/writing')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            📚 Practice More
          </button>
        </div>
      </div>
    </div>
  );
};

export default WritingDetail;
