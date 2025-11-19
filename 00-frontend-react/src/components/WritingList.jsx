import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/utils/axios.customize';
import { Clock, BookOpen, TrendingUp, Award, Search, Filter, X, Edit3, History } from 'lucide-react';

const WritingList = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTaskType, setFilterTaskType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const navigate = useNavigate();

  // Skeleton Loader
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300"></div>
      <div className="p-6 space-y-4">
        <div className="flex justify-between">
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-6 w-20 bg-gray-200 rounded"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-16 bg-gray-100 rounded"></div>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/writing');
      if (response?.data?.data && Array.isArray(response.data.data)) {
        setPrompts(response.data.data);
      } else if (response?.data && Array.isArray(response.data)) {
        setPrompts(response.data);
      } else if (Array.isArray(response)) {
        setPrompts(response);
      } else {
        setError('Failed to load writing prompts');
      }
    } catch (err) {
      console.error('Error fetching writing prompts:', err);
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWriting = (promptId) => {
    navigate(`/admin/features/writing/${promptId}`);
  };

  const handleViewHistory = () => {
    navigate('/admin/features/writing/history');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskTypeIcon = (taskType) => {
    return taskType === 'Task 1' ? '📊' : '📝';
  };

  // Filter prompts
  const filteredPrompts = prompts.filter(prompt => {
    const matchesTaskType = filterTaskType === 'all' || prompt.task_type === filterTaskType;
    const matchesSearch = prompt.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.prompt_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.topic?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || prompt.difficulty === selectedDifficulty;
    const matchesTopic = selectedTopic === 'all' || prompt.topic === selectedTopic;
    return matchesTaskType && matchesSearch && matchesDifficulty && matchesTopic;
  });

  // Get unique topics and difficulties
  const uniqueTopics = ['all', ...new Set(prompts.map(p => p.topic).filter(Boolean))];
  const difficulties = ['all', 'Easy', 'Medium', 'Hard'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-7xl">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 rounded-2xl shadow-2xl p-6 sm:p-8 mb-8 animate-pulse">
            <div className="h-10 bg-white/20 rounded w-1/2 mb-4"></div>
            <div className="h-6 bg-white/20 rounded w-3/4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header with Stats */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 rounded-2xl shadow-2xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Edit3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  IELTS Writing Practice
                </h1>
                <p className="text-white/90 text-sm sm:text-base">
                  Choose an article topic and get detailed feedback from AI
                </p>
              </div>
            </div>
            <button
              onClick={handleViewHistory}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-xl transition-all transform hover:scale-105 border-2 border-white/30"
            >
              <History className="h-5 w-5" />
              History
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                <BookOpen className="h-4 w-4" />
                <span>Total Prompts</span>
              </div>
              <div className="text-2xl font-bold text-white">{prompts.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                <TrendingUp className="h-4 w-4" />
                <span>Topics</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {new Set(prompts.map(p => p.topic)).size}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                <Clock className="h-4 w-4" />
                <span>Avg. Time</span>
              </div>
              <div className="text-2xl font-bold text-white">40 min</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                <Award className="h-4 w-4" />
                <span>Min Words</span>
              </div>
              <div className="text-2xl font-bold text-white">150-250</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for topics by title, subject, content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Bộ lọc:</span>
            </div>
            
            {/* Task Type Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterTaskType('all')}
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  filterTaskType === 'all'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterTaskType('Task 1')}
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  filterTaskType === 'Task 1'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Task 1
              </button>
              <button
                onClick={() => setFilterTaskType('Task 2')}
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  filterTaskType === 'Task 2'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📝 Task 2
              </button>
            </div>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm font-medium"
            >
              {difficulties.map(diff => (
                <option key={diff} value={diff}>
                  {diff === 'all' ? 'All difficulties' : diff}
                </option>
              ))}
            </select>

            {/* Topic Filter */}
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm font-medium"
            >
              {uniqueTopics.map(topic => (
                <option key={topic} value={topic}>
                  {topic === 'all' ? 'All topics' : topic}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            {(searchTerm || selectedDifficulty !== 'all' || selectedTopic !== 'all' || filterTaskType !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDifficulty('all');
                  setSelectedTopic('all');
                  setFilterTaskType('all');
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-all"
              >
                Clear Filters
              </button>
            )}

            {/* Results Count */}
            <div className="ml-auto text-sm text-gray-600 flex items-center">
              <span className="font-semibold text-purple-600">{filteredPrompts.length}</span>
              <span className="ml-1">/ {prompts.length} topic</span>
            </div>
          </div>
        </div>

        {/* Prompts Grid */}
        {filteredPrompts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">✍️</div>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm || selectedDifficulty !== 'all' || selectedTopic !== 'all' || filterTaskType !== 'all'
                ? 'No matching topics found'
                : 'No topics available'}
            </p>
            {(searchTerm || selectedDifficulty !== 'all' || selectedTopic !== 'all' || filterTaskType !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDifficulty('all');
                  setSelectedTopic('all');
                  setFilterTaskType('all');
                }}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 border-2 border-transparent hover:border-purple-300"
            >
              {/* Gradient Top Bar */}
              <div className={`h-2 ${
                prompt.task_type === 'Task 1' 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}></div>

              <div className="p-6">
                {/* Task Type Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl">{getTaskTypeIcon(prompt.task_type)}</span>
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    prompt.task_type === 'Task 1'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {prompt.task_type}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 h-14 group-hover:text-purple-600 transition-colors">
                  {prompt.title}
                </h3>

                {/* Prompt Preview */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 h-16">
                  {prompt.prompt_text}
                </p>

                {/* Metadata */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(prompt.difficulty)}`}>
                    {prompt.difficulty}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200">
                    {prompt.topic}
                  </span>
                </div>

                {/* Requirements */}
                <div className="flex justify-between text-xs text-gray-500 mb-4 bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-1">
                    <Edit3 className="h-3 w-3" />
                    <span>Min {prompt.word_limit} words</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{prompt.time_limit} min</span>
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={() => handleStartWriting(prompt.id)}
                  className={`w-full font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
                    prompt.task_type === 'Task 1'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  } text-white`}
                >
                  Start writing →
                </button>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default WritingList;
