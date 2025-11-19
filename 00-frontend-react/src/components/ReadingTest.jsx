import React, { useState, useEffect, useRef } from 'react';
import axios from '@/utils/axios.customize';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen, CheckCircle, XCircle, Award, TrendingUp, RefreshCw, Eye } from 'lucide-react';

const ReadingTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [passage, setPassage] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showPassage, setShowPassage] = useState(true);
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
      const response = await axios.get(`/api/reading/${id}`);
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
      setResult(null);
      setTimeElapsed(0);
      setTimerActive(false);
    } catch (error) {
      console.error('Error fetching reading:', error);
      alert('The reading could not be loaded. Please try again!');
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
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = async () => {
    // Kiểm tra đã trả lời hết chưa
    if (Object.keys(answers).length !== questions.length) {
      alert('Please answer all questions before submitting!');
      return;
    }


    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('You are not logged in! Please log in to submit your answers.');
      navigate('/login');
      return;
    }


    if (!window.confirm('Are you sure you want to submit? You will not be able to make changes after submitting.')) {
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId: parseInt(questionId),
          // option ids can be letters like 'A' or numbers; send both forms so backend can handle either
          selectedOptionId: selectedOptionId,
          userAnswer: String(selectedOptionId)
        }))
      };

      const response = await axios.post(
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
        alert('Your session has expired. Please log in again!');
        localStorage.removeItem('access_token');
        navigate('/login');
      } else if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('An error occurred while submitting. Please try again!');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex justify-center items-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading reading...</div>
          <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (!passage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Reading not found</h2>
          <p className="text-gray-600 mb-6">The reading does not exist or has been deleted.</p>
          <button
            onClick={() => navigate('/admin/features/reading')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
          >
            Back to list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Back Button & Title */}
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => navigate('/admin/features/reading')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors group"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 line-clamp-1">
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
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 rounded-xl">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-bold text-blue-600">{formatTime(timeElapsed)}</span>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-xl">
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
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>
        </div>

        {/* Two Column Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Passage Column */}
          <div ref={passageRef} className="bg-white rounded-2xl shadow-lg p-6 lg:sticky lg:top-32 lg:self-start">
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
            
            <div className="prose max-w-none">
              {(() => {
                const passageText = passage?.passage ?? passage?.content ?? passage?.passage_text ?? '';
                if (!passageText) {
                  return <p className="text-gray-500 italic">No passage content available.</p>;
                }
                return passageText.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4 text-justify leading-relaxed text-gray-700">
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
          </div>

          {/* Questions Column */}
          <div ref={questionsRef} className="bg-white rounded-2xl shadow-lg p-6">
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
            
            <div className="space-y-6">
              {questions.map((question, qIdx) => (
                <div key={question.id} className="pb-6 border-b border-gray-200 last:border-0">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-start gap-2">
                    <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {qIdx + 1}
                    </span>
                    <span className="flex-1">{question.question_text}</span>
                  </h3>
                  
                  <div className="space-y-2 ml-9">
                    {question.options.map((option) => {
                      const isSelected = answers[question.id] === option.id;
                      const questionDetail = result?.details?.find(d => d.questionId === question.id);
                      const isCorrect = questionDetail?.correctOptionId === option.id || questionDetail?.isCorrect === true;
                      const isWrong = result && isSelected && !isCorrect;
                      
                      return (
                        <label
                          key={option.id}
                          className={`group flex items-start p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            result
                              ? isCorrect
                                ? 'bg-green-50 border-green-500 shadow-sm'
                                : isWrong
                                ? 'bg-red-50 border-red-500 shadow-sm'
                                : 'border-gray-200 bg-gray-50'
                              : isSelected
                              ? 'bg-blue-50 border-blue-500 shadow-md'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
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
                </div>
              ))}
            </div>

            {/* Submit Button or Result */}
            {!result ? (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(answers).length !== questions.length}
                  className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all transform ${
                    submitting || Object.keys(answers).length !== questions.length
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </span>
                  ) : Object.keys(answers).length === questions.length ? (
                    'Submit'
                  ) : (
                    `Answer ${Object.keys(answers).length}/${questions.length} questions  `
                  )}
                </button>
                {Object.keys(answers).length !== questions.length && (
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Please answer all questions before submitting.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-8 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl shadow-2xl p-8 text-white">
                <div className="text-center mb-6">
                  <Award className="h-16 w-16 mx-auto mb-4 animate-bounce" />
                  <h2 className="text-3xl font-bold mb-2">Your Results</h2>
                  <p className="text-white/90">Completed in {formatTime(timeElapsed)}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-3xl font-bold">{result.score}</div>
                    <div className="text-sm opacity-90">Correct Answers</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <BookOpen className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-3xl font-bold">{result.totalQuestions}</div>
                    <div className="text-sm opacity-90">Total Questions</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-3xl font-bold">{result.percentage}%</div>
                    <div className="text-sm opacity-90">Score</div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={fetchReading}
                    className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="h-5 w-5" />
                    Retry
                  </button>
                  <button
                    onClick={() => navigate('/admin/features/reading')}
                    className="flex-1 bg-white text-purple-600 hover:bg-gray-100 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95"
                  >
                    Reading List
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingTest;
