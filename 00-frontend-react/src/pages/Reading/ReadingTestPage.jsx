import React, { useState, useEffect, useRef } from 'react';
import apiClient from '@/services/apiClient';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen, CheckCircle, XCircle, Award, TrendingUp, RefreshCw, Eye, Flag } from 'lucide-react';
import Button from '@/components/ui/Button';
import StatePanel from '@/components/ui/StatePanel';

const ReadingTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examMode = searchParams.get('mode') === 'exam';
  const [loading, setLoading] = useState(true);
  const [passage, setPassage] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const questionsRef = useRef(null);
  const passageRef = useRef(null);

  useEffect(() => {
    fetchReading();
  }, [id]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerActive && !result) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, result]);

  // Start timer on first answer
  useEffect(() => {
    if (Object.keys(answers).length > 0 && !timerActive && !result) {
      setTimerActive(true);
    }
  }, [answers, timerActive, result]);

  const fetchReading = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const response = await apiClient.get(`/api/reading/${id}`);
      let payload = response;
      if (response?.data?.data) {
        payload = response.data.data;
      } else if (response?.data) {
        payload = response.data;
      }

      const { passage, questions } = payload;
      setPassage(passage);
      setQuestions(questions || []);
      setAnswers({});
      setFlagged({});
      setResult(null);
      setTimeElapsed(0);
      setTimerActive(false);
    } catch (error) {
      console.error('Error fetching reading:', error);
      setPassage(null);
      setLoadError('The reading could not be loaded. Check the service and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return (Object.keys(answers).length / questions.length) * 100;
  };

  const scrollToQuestions = () => {
    questionsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPassage = () => {
    passageRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOptionChange = (questionId, optionId) => {
    setSubmitError('');
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = async () => {
    // Kiểm tra đã trả lời hết chưa
    if (Object.keys(answers).length !== questions.length) {
      setSubmitError('Answer every question before submitting your reading attempt.');
      return;
    }


    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError('');
      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId: parseInt(questionId),
          // option ids can be letters like 'A' or numbers; send both forms so backend can handle either
          selectedOptionId: selectedOptionId,
          userAnswer: String(selectedOptionId)
        }))
      };

      const response = await apiClient.post(
        `/api/reading/${id}/submit`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Normalize submit response and set the inner result object
      const submitPayload = response?.data?.data ?? response?.data ?? response;
      const resultData = submitPayload?.data ?? submitPayload;
      setResult(resultData);
    } catch (error) {
      console.error('Error submitting reading:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/login');
      } else if (error.response?.data?.message) {
        setSubmitError(error.response.data.message);
      } else {
        setSubmitError('We couldn’t submit your answers. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-6"><div className="h-7 w-2/3 rounded bg-slate-200" /><div className="mt-6 grid gap-6 lg:grid-cols-2"><div className="h-96 rounded-lg bg-slate-100" /><div className="h-96 rounded-lg bg-slate-100" /></div></div>
      </div>
    );
  }

  if (!passage) {
    return (
      <div className="page-shell">
        <StatePanel tone={loadError ? 'error' : 'neutral'} icon={<BookOpen className="h-5 w-5" />} title={loadError ? 'We couldn’t load this reading' : 'Reading not found'} description={loadError || 'The reading does not exist or is no longer available.'} action={<div className="flex gap-2"><Button onClick={fetchReading}>Try again</Button><Button variant="secondary" onClick={() => navigate('/admin/features/reading')}>Back to list</Button></div>} />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-[1440px]">
        {/* Sticky Header */}
        <div className="sticky top-16 z-20 mb-6 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur sm:p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Back Button & Title */}
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => navigate('/admin/features/reading')}
                className="flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="flex-1">
                <h1 className="line-clamp-1 text-lg font-bold text-slate-950 sm:text-xl">
                  {passage.title}
                </h1>
                <div className="flex gap-2 mt-1">
                  <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
                    {passage.difficulty}
                  </span>
                  <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">
                    {passage.topic}
                  </span>
                </div>
              </div>
            </div>

            {/* Timer & Progress */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-bold text-blue-600">{formatTime(timeElapsed)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                <span className="font-bold text-purple-600">
                  {Object.keys(answers).length}/{questions.length}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Completion Progress</span>
              <span>{Math.round(getProgress())}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 transition-[width] duration-300 ease-out"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>
        </div>

        {/* Two Column Layout for Desktop */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          {/* Passage Column */}
          <section ref={passageRef} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-48 lg:max-h-[calc(100vh-13rem)] lg:self-start lg:overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                Reading Passage
              </h2>
              <button
                onClick={scrollToQuestions}
                className="lg:hidden px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                To the questions →
              </button>
            </div>
            
            <div className="max-w-none text-[1.05rem] leading-8 text-slate-700">
              {(() => {
                const passageText = passage?.passage ?? passage?.content ?? passage?.passage_text ?? '';
                if (!passageText) {
                  return <p className="text-gray-500 italic">No passage content available.</p>;
                }
                return passageText.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-5 text-left leading-8 text-slate-700">
                    {paragraph}
                  </p>
                ));
              })()}
            </div>

            {passage.reading_time && (
              <div className="mt-6 pt-4 border-t border-gray-200 flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Suggested time: {passage.reading_time}</span>
              </div>
            )}
          </section>

          {/* Questions Column */}
          <section ref={questionsRef} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Eye className="h-6 w-6 text-purple-600" />
                Questions ({questions.length})
              </h2>
              <button
                onClick={scrollToPassage}
                className="lg:hidden px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                ← Back to passage
              </button>
            </div>
            <nav aria-label="Question progress" className="mb-6 flex flex-wrap gap-2">
              {questions.map((question, index) => <button key={question.id} type="button" onClick={() => document.getElementById(`reading-question-${question.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className={`relative flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold ${flagged[question.id] ? 'border-amber-500 bg-amber-50 text-amber-800' : answers[question.id] ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'}`} aria-label={`Question ${index + 1}, ${answers[question.id] ? 'answered' : 'unanswered'}${flagged[question.id] ? ', flagged' : ''}`}>{index + 1}{flagged[question.id] && <Flag className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 fill-amber-500 text-amber-600" />}</button>)}
            </nav>
            
            <div className="space-y-6">
              {questions.map((question, qIdx) => (
                <fieldset id={`reading-question-${question.id}`} key={question.id} className="scroll-mt-48 border-b border-slate-200 pb-6 last:border-0">
                  <legend className="mb-4 flex w-full items-start gap-2 font-semibold text-slate-900">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                      {qIdx + 1}
                    </span>
                    <span className="flex-1">{question.question_text}</span>
                    {!result && !examMode && <button type="button" onClick={() => setFlagged(value => ({ ...value, [question.id]: !value[question.id] }))} className={`inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold ${flagged[question.id] ? 'bg-amber-100 text-amber-800' : 'text-slate-500 hover:bg-slate-100'}`}><Flag className={`h-4 w-4 ${flagged[question.id] ? 'fill-current' : ''}`} /> {flagged[question.id] ? 'Flagged' : 'Flag'}</button>}
                  </legend>
                  
                  <div className="space-y-2 ml-9">
                    {question.options.map((option) => {
                      const isSelected = answers[question.id] === option.id;
                      const questionDetail = result?.details?.find(
                        detail => String(detail.questionId) === String(question.id)
                      );
                      const isCorrect = Boolean(
                        result && questionDetail &&
                        String(questionDetail.correctAnswer).trim().toLowerCase() ===
                          String(option.id).trim().toLowerCase()
                      );
                      const isWrong = Boolean(
                        result && isSelected && questionDetail && !questionDetail.isCorrect
                      );
                      
                      return (
                        <label
                          key={option.id}
                          className={`group flex min-h-12 cursor-pointer items-start rounded-lg border p-3 transition-colors ${
                            result
                              ? isCorrect
                                ? 'bg-green-50 border-green-500 shadow-sm'
                                : isWrong
                                ? 'bg-red-50 border-red-500 shadow-sm'
                                : 'border-gray-200 bg-gray-50'
                              : isSelected
                              ? 'border-brand-500 bg-brand-50'
                              : 'border-slate-200 hover:border-brand-300 hover:bg-brand-50/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option.id}
                            checked={isSelected}
                            onChange={() => handleOptionChange(question.id, option.id)}
                            disabled={!!result}
                            className="mt-1 mr-3 flex-shrink-0"
                          />
                          <span className="flex-1 text-gray-700">
                            {option.option_text}
                            {result && isCorrect && (
                              <span className="ml-2 inline-flex items-center gap-1 text-green-600 font-semibold">
                                <CheckCircle className="h-4 w-4" />
                                Correct answer
                              </span>
                            )}
                            {result && isWrong && (
                              <span className="ml-2 inline-flex items-center gap-1 text-red-600 font-semibold">
                                <XCircle className="h-4 w-4" />
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {result && (() => {
                    const detail = result.details?.find(value => String(value.questionId) === String(question.id));
                    if (!detail) return null;
                    return <div className={`ml-9 mt-4 rounded-lg border p-4 text-sm leading-6 ${detail.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}><p className="font-semibold text-slate-900">{detail.isCorrect ? 'Correct' : 'Review this answer'}</p><p className="mt-1 text-slate-700"><strong>Your answer:</strong> {String(detail.userAnswer)}</p><p className="text-slate-700"><strong>Correct answer:</strong> {String(detail.correctAnswer)}</p>{detail.explanation && <p className="mt-2 text-slate-700"><strong>Explanation:</strong> {detail.explanation}</p>}</div>;
                  })()}
                </fieldset>
              ))}
            </div>

            {/* Submit Button or Result */}
            {!result ? (
              <div className="mt-8 border-t border-slate-200 pt-6">
                {submitError && <p role="alert" className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{submitError}</p>}
                <Button onClick={handleSubmit} isLoading={submitting} disabled={Object.keys(answers).length !== questions.length} className="w-full">{submitting ? 'Submitting answers…' : 'Submit answers'}</Button>
                {Object.keys(answers).length !== questions.length && (
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Please answer all questions before submitting.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-8 rounded-xl border border-brand-200 bg-brand-50 p-5 sm:p-6">
                <div className="text-center mb-6">
                  <Award className="mx-auto mb-3 h-10 w-10 text-brand-700" />
                  <h2 className="text-2xl font-bold text-slate-950">Your results</h2>
                  <p className="mt-1 text-sm text-slate-600">Completed in {formatTime(timeElapsed)}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="rounded-lg bg-white p-3 text-center shadow-sm">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-3xl font-bold">{result.score}</div>
                    <div className="text-sm opacity-90">Correct Answers</div>
                  </div>
                  <div className="rounded-lg bg-white p-3 text-center shadow-sm">
                    <BookOpen className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-3xl font-bold">{result.totalQuestions}</div>
                    <div className="text-sm opacity-90">Total Questions</div>
                  </div>
                  <div className="rounded-lg bg-white p-3 text-center shadow-sm">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-3xl font-bold">{result.percentage}%</div>
                    <div className="text-sm opacity-90">Score</div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  {!examMode && <button
                    onClick={fetchReading}
                    className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <RefreshCw className="h-5 w-5" />
                    Retry
                  </button>}
                  <button
                    onClick={() => navigate('/admin/features/reading')}
                    className="min-h-11 flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    Reading List
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReadingTest;
