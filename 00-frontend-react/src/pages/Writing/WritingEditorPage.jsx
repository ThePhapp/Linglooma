import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '@/services/apiClient';
import { AlertCircle, ArrowLeft, Clock, FileText, Lightbulb, LoaderCircle, Save } from 'lucide-react';
import Button from '@/components/ui/Button';
import StatePanel from '@/components/ui/StatePanel';

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
  const [submitError, setSubmitError] = useState('');

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
      setSubmitError('');
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
        localStorage.removeItem('access_token');
        navigate('/login');
      } else {
        setSubmitError(err.response?.data?.message || 'We couldn’t evaluate your essay. Your draft is still saved; please try again.');
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
      <div className="page-shell" role="status">
        <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-6"><div className="h-7 w-2/3 rounded bg-slate-200" /><div className="mt-6 grid gap-6 lg:grid-cols-[minmax(280px,0.4fr)_minmax(0,0.6fr)]"><div className="h-80 rounded-lg bg-slate-100" /><div className="h-[32rem] rounded-lg bg-slate-100" /></div></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <StatePanel tone="error" icon={<AlertCircle className="h-5 w-5" />} title="We couldn’t load this writing task" description={error} action={<Button onClick={fetchPrompt}>Try again</Button>} />
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="page-shell">
        <StatePanel icon={<FileText className="h-5 w-5" />} title="Writing task not found" description="This prompt is no longer available." action={<Button variant="secondary" onClick={() => navigate('/admin/features/writing')}>Back to prompts</Button>} />
      </div>
    );
  }

  // Show result page after submission
  if (result) {
    return (
      <div className="page-shell max-w-5xl">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:p-8">
          {/* Header */}
          <p className="text-sm font-semibold text-brand-700">Writing feedback</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Essay evaluation results</h1>
          <p className="mb-6 mt-2 text-sm text-slate-600 sm:text-base">{prompt.title}</p>

          {/* Overall Band Score */}
          <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50 p-5 sm:p-6">
            <div className="text-center">
              <p className="mb-2 text-sm font-semibold text-brand-800 sm:text-base">Overall band score</p>
              <p className="text-5xl font-bold text-brand-800 sm:text-6xl">{result.scores.overall_band}</p>
              <p className="mt-2 text-sm text-slate-600">{result.wordCount} words</p>
            </div>
          </div>

          {/* Individual Scores */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Task Achievement</p>
              <p className={`text-2xl sm:text-3xl font-bold ${getBandColor(result.scores.task_achievement)}`}>
                {result.scores.task_achievement}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Coherence & Cohesion</p>
              <p className={`text-2xl sm:text-3xl font-bold ${getBandColor(result.scores.coherence_cohesion)}`}>
                {result.scores.coherence_cohesion}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Lexical Resource</p>
              <p className={`text-2xl sm:text-3xl font-bold ${getBandColor(result.scores.lexical_resource)}`}>
                {result.scores.lexical_resource}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center sm:p-4">
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
              <h3 className="mb-2 text-lg font-semibold text-emerald-800 sm:text-xl">Strengths</h3>
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">{result.feedback.strengths}</p>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-amber-800 sm:text-xl">Areas to improve</h3>
              <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
                <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">{result.feedback.weaknesses}</p>
              </div>
            </div>
          </div>

          {/* Grammar Errors */}
          {result.feedback.grammar_errors && result.feedback.grammar_errors.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold sm:text-xl">Grammar corrections</h3>
              <div className="space-y-3">
                {result.feedback.grammar_errors.map((error, index) => (
                  <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 rounded">
                    <p className="mb-1 text-sm font-medium text-red-700 sm:text-base">Original: {error.error}</p>
                    <p className="mb-2 text-sm font-medium text-emerald-700 sm:text-base">Correction: {error.correction}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{error.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vocabulary Suggestions */}
          {result.feedback.vocabulary_suggestions && result.feedback.vocabulary_suggestions.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-xl font-semibold">Vocabulary suggestions</h3>
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
            <h3 className="mb-2 text-xl font-semibold">Structure and organization</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-line">
              {result.feedback.structure_feedback}
            </p>
          </div>

          {/* Improvement Tips */}
          <div className="mb-6">
            <h3 className="mb-2 text-xl font-semibold">Suggestions for improvement</h3>
            <p className="text-gray-700 bg-blue-50 p-4 rounded-lg whitespace-pre-line">
              {result.feedback.improvement_tips}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleRetry}
              className="min-h-11 flex-1 rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700"
            >
              Write Again
            </button>
            <button
              onClick={() => navigate('/admin/features/writing')}
              className="min-h-11 flex-1 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
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
    <div className="page-shell max-w-[1440px]">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <button type="button" onClick={() => navigate('/admin/features/writing')} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100" aria-label="Back to writing prompts"><ArrowLeft className="h-5 w-5" /></button>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand-700">{prompt.task_type} · {prompt.difficulty}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{prompt.title}</h1>
          </div>
        </div>
        <div className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${timeRemaining < 300 ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-700'}`}>
          <Clock className="h-4 w-4" aria-hidden="true" /> {formatTime(timeRemaining)} remaining
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,0.38fr)_minmax(0,0.62fr)]">
        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24 sm:p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-700"><FileText className="h-4 w-4" aria-hidden="true" /> Writing task</div>
          <p className="mt-4 whitespace-pre-line text-base leading-7 text-slate-800">{prompt.prompt}</p>
          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-slate-50 p-3"><dt className="text-slate-500">Minimum</dt><dd className="mt-1 font-semibold text-slate-900">{prompt.word_limit} words</dd></div>
            <div className="rounded-lg bg-slate-50 p-3"><dt className="text-slate-500">Suggested time</dt><dd className="mt-1 font-semibold text-slate-900">{prompt.time_limit} min</dd></div>
          </dl>
          <button type="button" onClick={() => setShowTips(value => !value)} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-brand-700"><Lightbulb className="h-4 w-4" aria-hidden="true" />{showTips ? 'Hide writing tips' : 'Show writing tips'}</button>
          {showTips && <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">Plan briefly before writing, use clear paragraphs, and leave time to review grammar and word choice.</p>}
        </aside>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="essay-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 id="essay-heading" className="font-bold text-slate-950">Your response</h2><p className="mt-1 text-xs text-slate-500">Drafts are saved in this browser while you type.</p></div>
            <div className="flex items-center gap-3 text-sm">
              {lastSaved && <span className="inline-flex items-center gap-1.5 text-slate-500"><Save className="h-4 w-4" aria-hidden="true" /> Saved</span>}
              <span className={`rounded-full px-3 py-1 font-semibold ${getWordCount() >= prompt.word_limit ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{getWordCount()} / {prompt.word_limit} words</span>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true"><div className="h-full bg-brand-600 transition-[width]" style={{ width: `${getProgress()}%` }} /></div>
          <textarea value={essayText} onChange={handleTextChange} className="mt-5 min-h-[26rem] w-full resize-y rounded-lg border border-slate-300 bg-white p-4 text-base leading-8 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50 sm:min-h-[34rem]" placeholder="Write your response here…" disabled={submitting} aria-describedby="essay-status" />

          <div id="essay-status" className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
            <span className="text-slate-500">{getCharCount()} characters · {getSentenceCount()} sentences</span>
            {essayText && getWordCount() < prompt.word_limit && <span className="font-medium text-amber-700">{prompt.word_limit - getWordCount()} more words to reach the minimum</span>}
          </div>

          {submitError && <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{submitError}</div>}
          {submitting && <div role="status" className="mt-4 flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800"><LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" /><span><strong>Analyzing your response…</strong><br />This may take a moment. Keep this page open.</span></div>}

          <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => navigate('/admin/features/writing')} disabled={submitting}>Back to prompts</Button>
            <Button onClick={handleSubmit} isLoading={submitting} disabled={!essayText.trim()}>{submitting ? 'Evaluating response…' : 'Submit for evaluation'}</Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WritingEditor;
