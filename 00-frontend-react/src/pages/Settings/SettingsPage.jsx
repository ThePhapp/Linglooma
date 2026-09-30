import React, { useContext, useState } from "react";
import ProfileSettingsForm from "./components/ProfileSettingsForm";
import PasswordSettingsForm from "./components/PasswordSettingsForm";
import Button from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/contexts/AuthContext";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl">⚙️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Account Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your profile and preferences
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-200 transform active:scale-95 flex items-center gap-2"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-purple-100">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {username?.charAt(0)?.toUpperCase() || '👤'}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{username || 'User'}</h2>
            <p className="text-gray-600">{email || 'No email'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg mb-6 border border-purple-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span>👤</span>
              <span>Profile Information</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span>🔒</span>
              <span>Security & Password</span>
            </span>
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'profile' && <ProfileSettingsForm />}
          {activeTab === 'security' && <PasswordSettingsForm />}
        </div>
      </div>

      {/* Footer Tip */}
      <div className="text-center text-sm text-gray-500">
        💡 Tip: Keep your information up to date for the best experience
      </div>
    </div>
  );
};

export default SettingsPage;
