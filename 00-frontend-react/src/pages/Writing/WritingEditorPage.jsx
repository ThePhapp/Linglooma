import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '@/services/apiClient';
import { Save, AlertCircle, Lightbulb, TrendingUp, Target, Award, ArrowLeft } from 'lucide-react';

const WritingEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [prompt, setPrompt] = useState(null);
  const [essayText, setEssayText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timerStarted, setTimerStarted] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    fetchPrompt();
  }, [id]);

useEffect(() => {
  if (timerStarted && timeRemaining > 0) {
    const timer = setTimeout(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  } else if (timeRemaining === 0) {
    setTimerStarted(false);
  }
}, [timerStarted, timeRemaining]);

  // Auto-save to localStorage
  useEffect(() => {
    if (essayText && prompt) {
      const saveTimeout = setTimeout(() => {
        localStorage.setItem(`essay_draft_${id}`, essayText);
        setLastSaved(new Date());
      }, 2000);
      return () => clearTimeout(saveTimeout);
    }
  }, [essayText, id, prompt]);

  // Load saved draft on mount
  useEffect(() => {
    if (prompt && !essayText) {
      const savedDraft = localStorage.getItem(`essay_draft_${id}`);
      if (savedDraft) {
        setEssayText(savedDraft);
      }
    }
  }, [prompt, id]);

  const fetchPrompt = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/writing/${id}`);

      let payload = response;
      if (response?.data?.data) {
        payload = response.data.data;
      } else if (response?.data) {
        payload = response.data;
      }

      if (payload) {
        setPrompt(payload);
        if (payload.time_limit) setTimeRemaining(payload.time_limit * 60);
      } else {
        setError('Failed to load writing prompt');
      }
    } catch (err) {
      console.error('Error fetching prompt:', err);
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (e) => {
    if (!timerStarted) {
      setTimerStarted(true);
    }
    setEssayText(e.target.value);
  };

  const getWordCount = () => {
    return essayText.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharCount = () => {
    return essayText.length;
  };

  const getSentenceCount = () => {
    return essayText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  };

  const getProgress = () => {
    if (!prompt?.word_limit) return 0;
    return Math.min((getWordCount() / prompt.word_limit) * 100, 100);
  };

  const getProgressColor = () => {
    const progress = getProgress();
    if (progress >= 100) return 'from-green-500 to-emerald-500';
    if (progress >= 75) return 'from-yellow-500 to-orange-500';
    if (progress >= 50) return 'from-blue-500 to-cyan-500';
    return 'from-red-500 to-pink-500';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    const wordCount = getWordCount();
    
    if (wordCount < prompt.word_limit) {
      if (!window.confirm(`Your essay has only ${wordCount} words (minimum: ${prompt.word_limit}). Submit anyway?`)) {
        return;
      }
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Please login to submit your essay');
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiClient.post(
        `/api/writing/${id}/submit`,
        { essayText },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Normalize submit response
      const submitPayload = response?.data?.data ?? response?.data ?? response;
      const resultData = submitPayload?.data ?? submitPayload;
      setResult(resultData);
      setTimerStarted(false);
    } catch (err) {
      console.error('Error submitting essay:', err);
      if (err.response?.status === 401) {
        alert('Session expired. Please login again.');
        navigate('/login');
      } else {
        alert('Failed to submit essay: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setEssayText('');
    setResult(null);
    setTimeRemaining(prompt.time_limit * 60);
    setTimerStarted(false);
  };

  const getBandColor = (band) => {
    if (band >= 7) return 'text-green-600';
    if (band >= 6) return 'text-yellow-600';
    if (band >= 5) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading prompt...</div>
          <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Lỗi kết nối</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Prompt not found</div>
      </div>
    );
  }

  // Show result page after submission
  if (result) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-5xl">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Essay Evaluation Results</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6">{prompt.title}</p>

          {/* Overall Band Score */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 sm:p-6 mb-6">
            <div className="text-center">
              <p className="text-base sm:text-lg mb-2">Overall Band Score</p>
              <p className="text-4xl sm:text-5xl lg:text-6xl font-bold">{result.scores.overall_band}</p>
              <p className="mt-2 text-sm sm:text-base text-blue-100">Words: {result.wordCount}</p>
            </div>
          </div>

          {/* Individual Scores */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Task Achievement</p>
              <p className={`text-2xl sm:text-3xl font-bold ${getBandColor(result.scores.task_achievement)}`}>
                {result.scores.task_achievement}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Coherence & Cohesion</p>
              <p className={`text-2xl sm:text-3xl font-bold ${getBandColor(result.scores.coherence_cohesion)}`}>
                {result.scores.coherence_cohesion}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Lexical Resource</p>
              <p className={`text-2xl sm:text-3xl font-bold ${getBandColor(result.scores.lexical_resource)}`}>
                {result.scores.lexical_resource}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Grammar Accuracy</p>
              <p className={`text-2xl sm:text-3xl font-bold ${getBandColor(result.scores.grammar_accuracy)}`}>
                {result.scores.grammar_accuracy}
              </p>
            </div>
          </div>

          {/* Overall Feedback */}
          <div className="mb-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Overall Feedback</h3>
            <p className="text-sm sm:text-base text-gray-700 bg-blue-50 p-3 sm:p-4 rounded-lg">{result.feedback.overall_feedback}</p>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-green-700">✅ Strengths</h3>
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">{result.feedback.strengths}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-red-700">⚠️ Areas to Improve</h3>
              <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
                <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">{result.feedback.weaknesses}</p>
              </div>
            </div>
          </div>

          {/* Grammar Errors */}
          {result.feedback.grammar_errors && result.feedback.grammar_errors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3">📝 Grammar Errors & Corrections</h3>
              <div className="space-y-3">
                {result.feedback.grammar_errors.map((error, index) => (
                  <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 rounded">
                    <p className="text-sm sm:text-base text-red-600 font-medium mb-1">❌ {error.error}</p>
                    <p className="text-sm sm:text-base text-green-600 font-medium mb-2">✅ {error.correction}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{error.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vocabulary Suggestions */}
          {result.feedback.vocabulary_suggestions && result.feedback.vocabulary_suggestions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">💡 Vocabulary Enhancements</h3>
              <div className="space-y-3">
                {result.feedback.vocabulary_suggestions.map((vocab, index) => (
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
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">🏗️ Structure & Organization</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-line">
              {result.feedback.structure_feedback}
            </p>
          </div>

          {/* Improvement Tips */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">💪 Tips for Improvement</h3>
            <p className="text-gray-700 bg-blue-50 p-4 rounded-lg whitespace-pre-line">
              {result.feedback.improvement_tips}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleRetry}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Write Again
            </button>
            <button
              onClick={() => navigate('/admin/features/writing')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Back to Prompts
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Editor page
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-6xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-2">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold mb-1">{prompt.title}</h1>
              <p className="text-sm text-blue-100">{prompt.task_type} - {prompt.difficulty}</p>
            </div>
            <div className="text-left sm:text-right">
              <div className={`text-2xl sm:text-3xl font-bold ${timeRemaining < 300 ? 'text-red-300' : ''}`}>
                {formatTime(timeRemaining)}
              </div>
              <div className="text-xs sm:text-sm text-blue-100">Time Remaining</div>
            </div>
          </div>
        </div>

        {/* Prompt */}
        <div className="p-4 sm:p-6 bg-gray-50 border-b">
          <h3 className="font-semibold text-gray-800 mb-2">📋 Task:</h3>
          <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">{prompt.prompt}</p>
          <div className="mt-4 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <span>📝 Min {prompt.word_limit} words</span>
            <span>⏱️ {prompt.time_limit} min</span>
            <span>📚 {prompt.topic}</span>
          </div>
        </div>

        {/* Editor */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-800">Your Essay:</h3>
            <div className="flex gap-4 text-xs sm:text-sm">
              <span className={getWordCount() < prompt.word_limit ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                {getWordCount()} / {prompt.word_limit} words
              </span>
            </div>
          </div>
          
          <textarea
            value={essayText}
            onChange={handleTextChange}
            className="w-full h-64 sm:h-80 lg:h-96 p-3 sm:p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none font-mono text-sm sm:text-base"
            placeholder="Start typing your essay here..."
            disabled={submitting}
          />

          {/* Warning if word count is low */}
          {essayText.length > 0 && getWordCount() < prompt.word_limit && (
            <p className="mt-2 text-xs sm:text-sm text-red-600">
              ⚠️ Your essay is below the minimum word count. You need at least {prompt.word_limit - getWordCount()} more words.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-6 bg-gray-50 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/admin/features/writing')}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition text-sm sm:text-base"
            disabled={submitting}
          >
            ← Back
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
            disabled={submitting || essayText.trim().length === 0}
          >
            {submitting ? '⏳ Evaluating with AI...' : 'Submit for Evaluation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WritingEditor;
