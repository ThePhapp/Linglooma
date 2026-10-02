import React, { useContext, useState } from "react";
import ProfileSettingsForm from "./components/ProfileSettingsForm";
import PasswordSettingsForm from "./components/PasswordSettingsForm";
import Button from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/contexts/AuthContext";
import { LockKeyhole, LogOut, Settings, UserRound } from "lucide-react";
import apiClient from "@/services/apiClient";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);
  const username = auth?.user?.username;
  const email = auth?.user?.email;
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      user: {
        email: "",
        username: "",
        phonenumber: "",
        gender: "",
        nationality: ""
      }
    });
    localStorage.clear();
    navigate('/');
  };

  const exportLearningData = async () => {
    const blob = await apiClient.get('/api/learning/export', { responseType: 'blob' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `linglooma-learning-data-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="page-shell">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
              <Settings className="h-6 w-6 text-brand-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-950">
                Account Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your profile and preferences
              </p>
            </div>
          </div>

          <Button variant="danger" onClick={handleLogout}><LogOut className="h-4 w-4" /> Logout</Button>
        </div>
      </div>

      {/* User Info Card */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand-600 text-2xl font-bold text-white">
            {username?.charAt(0)?.toUpperCase() || <UserRound className="h-7 w-7" />}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{username || 'User'}</h2>
            <p className="text-gray-600">{email || 'No email'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 border-b-2 px-3 py-4 text-sm font-semibold transition-colors sm:px-6 sm:text-base ${
              activeTab === 'profile'
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <UserRound className="h-4 w-4" />
              <span>Profile Information</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 border-b-2 px-3 py-4 text-sm font-semibold transition-colors sm:px-6 sm:text-base ${
              activeTab === 'security'
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <LockKeyhole className="h-4 w-4" />
              <span>Security & Password</span>
            </span>
          </button>
        </div>

        <div className="p-4 sm:p-8">
          {activeTab === 'profile' && <ProfileSettingsForm />}
          {activeTab === 'security' && <PasswordSettingsForm />}
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-bold text-slate-950">Learning data</h2><p className="mt-1 text-sm leading-6 text-slate-600">Download your saved history, mistakes, and vocabulary as JSON.</p><Button variant="secondary" className="mt-4" onClick={exportLearningData}>Export learning data</Button></div>

    </main>
  );
};

export default SettingsPage;
