import React, { lazy, Suspense, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';

import HomePage from '@/pages/Home/HomePage';
import LoginPage from '@/pages/Auth/LoginPage';
import RegisterPage from '@/pages/Auth/RegisterPage';
import { ToastContainer } from 'react-toastify';
import { AlertCircle, LoaderCircle } from 'lucide-react';

const AdminLayout = lazy(() => import('@/pages/Admin/AdminLayout'));
const DashboardPage = lazy(() => import('@/pages/Dashboard/DashboardPage'));
const SkillsPage = lazy(() => import('@/pages/Skills/SkillsPage'));
const SpeakingCatalogPage = lazy(() => import('@/pages/Speaking/SpeakingCatalogPage'));
const ListeningPage = lazy(() => import('@/pages/Listening/ListeningPage'));
const SpeakingHistoryPage = lazy(() => import('@/pages/Speaking/SpeakingHistoryPage'));
const ReadingListPage = lazy(() => import('@/pages/Reading/ReadingListPage'));
const ReadingTestPage = lazy(() => import('@/pages/Reading/ReadingTestPage'));
const WritingListPage = lazy(() => import('@/pages/Writing/WritingListPage'));
const WritingHistoryPage = lazy(() => import('@/pages/Writing/WritingHistoryPage'));
const WritingDetailPage = lazy(() => import('@/pages/Writing/WritingDetailPage'));
const WritingEditorPage = lazy(() => import('@/pages/Writing/WritingEditorPage'));
const VoiceChatPage = lazy(() => import('@/pages/AiChat/VoiceChatPage'));
const AnalyticsPage = lazy(() => import('@/pages/Analytics/AnalyticsPage'));
const SettingsPage = lazy(() => import('@/pages/Settings/SettingsPage'));
const SpeakingPracticePage = lazy(() => import('@/pages/Speaking/SpeakingPracticePage'));
const SpeakingFeedbackPage = lazy(() => import('@/pages/Speaking/SpeakingFeedbackPage'));

const RouteLoading = () => (
  <div role="status" aria-live="polite" className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-600">
    <LoaderCircle aria-hidden="true" className="mr-3 h-5 w-5 animate-spin text-brand-600" />
    Loading your workspace…
  </div>
);

const RequireAuth = () => {
  const { auth, authLoading, authError } = useContext(AuthContext);
  const location = useLocation();

  if (authLoading) {
    return (
      <div role="status" className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-600">
        <LoaderCircle aria-hidden="true" className="mr-3 h-5 w-5 animate-spin text-brand-600" />
        Checking your session…
      </div>
    );
  }
  if (authError) {
    return (
      <div role="alert" className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <AlertCircle aria-hidden="true" className="mx-auto h-8 w-8 text-red-600" />
          <h1 className="mt-3 text-lg font-semibold text-slate-950">We couldn’t verify your session</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{authError}</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-4 min-h-11 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
            Try again
          </button>
        </div>
      </div>
    );
  }
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="features" element={<SkillsPage />} />
              <Route path="features/lesson" element={<SpeakingCatalogPage />} />
              <Route path="features/listening" element={<ListeningPage />} />
              <Route path="features/speaking/history" element={<SpeakingHistoryPage />} />
              <Route path="features/reading" element={<ReadingListPage />} />
              <Route path="features/reading/:id" element={<ReadingTestPage />} />
              <Route path="features/writing" element={<WritingListPage />} />
              <Route path="features/writing/history" element={<WritingHistoryPage />} />
              <Route path="features/writing/submissions/:submissionId" element={<WritingDetailPage />} />
              <Route path="features/writing/:id" element={<WritingEditorPage />} />
              <Route path="ai-chat" element={<VoiceChatPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="features/practice/:lessonId" element={<SpeakingPracticePage />} />
              <Route path="features/feedback/:lessonId" element={<SpeakingFeedbackPage />} />
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
