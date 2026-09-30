import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Home as HomeIcon } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
            <HomeIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Linglooma
            </h1>
            <p className="text-xs text-gray-500">English Excellence</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 font-semibold text-gray-700 hover:text-purple-600"
            onClick={() => navigate("/login")}
          >
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </button>
          <button
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            onClick={() => navigate("/register")}
          >
            <UserPlus className="w-4 h-4" />
            <span>Sign Up</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
