import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.jsx';
import '@styles/index.css';
import { AuthWrapper } from './contexts/AuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthWrapper>
      <App />
    </AuthWrapper>
  </React.StrictMode>
);
