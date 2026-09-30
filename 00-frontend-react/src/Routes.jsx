import React, { lazy, Suspense, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from './components/context/auth.context';

import HomePage from './pages/Home';
import PageLogin from './pages/Auth/Login';
import PageRegister from './pages/Auth/Register';
import { ToastContainer } from 'react-toastify';

const Admin = lazy(() => import('./pages/Admin/Admin'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Skill4 = lazy(() => import('./pages/Features/Skill4'));
const LessonSpeaking = lazy(() => import('./pages/Features/LessonSpeaking'));
const ListeningPractice = lazy(() => import('./pages/Features/Listening'));
const SpeakingHistory = lazy(() => import('./components/SpeakingHistory'));
const ReadingList = lazy(() => import('./components/ReadingList'));
const ReadingTest = lazy(() => import('./components/ReadingTest'));
const WritingList = lazy(() => import('./components/WritingList'));
const WritingHistory = lazy(() => import('./components/WritingHistory'));
const WritingDetail = lazy(() => import('./components/WritingDetail'));
const WritingEditor = lazy(() => import('./components/WritingEditor'));
const VoiceChat = lazy(() => import('./pages/AiChat/VoiceChat'));
const SmartAnalytics = lazy(() => import('./pages/ViewResults/SmartAnalytics'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const IeltsSpeakingPractice = lazy(() => import('./pages/Features/Practice'));
const PronunciationFeedback = lazy(() => import('./pages/Features/Feedback'));

const RouteLoading = () => (
  <div role="status" aria-live="polite" className="p-6">
    Loading page...
  </div>
);

const RequireAuth = () => {
  const { auth, authLoading, authError } = useContext(AuthContext);
  const location = useLocation();

  if (authLoading) return <div role="status">Checking your session...</div>;
  if (authError) return <div role="alert">{authError}</div>;
  return auth.isAuthenticated
    ? <Outlet />
    : <Navigate to="/login" state={{ from: location }} replace />;
};

const AppRoutes = () => {
  return (
    <Router>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<PageLogin />} />
          <Route path="/register" element={<PageRegister />} />

          <Route element={<RequireAuth />}>
            <Route path="/admin" element={<Admin />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="features" element={<Skill4 />} />
              <Route path="features/lesson" element={<LessonSpeaking />} />
              <Route path="features/listening" element={<ListeningPractice />} />
              <Route path="features/speaking/history" element={<SpeakingHistory />} />
              <Route path="features/reading" element={<ReadingList />} />
              <Route path="features/reading/:id" element={<ReadingTest />} />
              <Route path="features/writing" element={<WritingList />} />
              <Route path="features/writing/history" element={<WritingHistory />} />
              <Route path="features/writing/submissions/:submissionId" element={<WritingDetail />} />
              <Route path="features/writing/:id" element={<WritingEditor />} />
              <Route path="ai-chat" element={<VoiceChat />} />
              <Route path="analytics" element={<SmartAnalytics />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="features/practice/:lessonId" element={<IeltsSpeakingPractice />} />
              <Route path="features/feedback/:lessonId" element={<PronunciationFeedback />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        rtl={false}
      />

    </Router>

  );
};

export default AppRoutes;
