import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/services/apiClient';

const WritingHistory = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get('/api/writing/submissions/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Normalize response
      const payload = response?.data ?? response;
      const submissionsData = payload?.data ?? payload;
      if (Array.isArray(submissionsData)) {
        setSubmissions(submissionsData);
      } else {
        setError('Failed to load submission history');
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      if (err.response?.status === 401) {
        alert('Session expired. Please login again.');
        navigate('/login');
      } else {
        setError('Could not connect to server');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (submissionId) => {
    navigate(`/admin/features/writing/submissions/${submissionId}`);
  };

  const getBandColor = (band) => {
    if (!band) return 'text-gray-500';
    if (band >= 7) return 'text-green-600';
    if (band >= 6) return 'text-yellow-600';
    if (band >= 5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading submission history...</div>
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">My Writing Submissions</h1>
        <p className="text-gray-600">Review your past essays and AI feedback</p>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/features/writing')}
        className="mb-6 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
      >
        ← Back to Prompts
      </button>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-xl text-gray-500 mb-4">No submissions yet</p>
          <button
            onClick={() => navigate('/admin/features/writing')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Start Writing Practice
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.submission_id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {submission.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                        {submission.task_type}
                      </span>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getDifficultyColor(submission.difficulty)}`}>
                        {submission.difficulty}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
                        {submission.topic}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>📅 {formatDate(submission.submitted_at)}</span>
                      <span>📝 {submission.word_count} words</span>
                    </div>
                  </div>
                  
                  {/* Band Score */}
                  <div className="ml-4 text-center">
                    {submission.overall_band ? (
                      <>
                        <div className={`text-4xl font-bold ${getBandColor(submission.overall_band)}`}>
                          {submission.overall_band}
                        </div>
                        <div className="text-sm text-gray-500">Band Score</div>
                      </>
                    ) : (
                      <div className="text-gray-500">
                        <div className="text-2xl">⏳</div>
                        <div className="text-sm">Evaluating...</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* View Detail Button */}
                <button
                  onClick={() => handleViewDetail(submission.submission_id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  View Detailed Feedback
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WritingHistory;
