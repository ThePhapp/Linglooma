import { useContext, useEffect } from 'react';
import AppRoutes from './AppRoutes';
import apiClient from '@/services/apiClient';
import { AuthContext } from '@/contexts/AuthContext';

function App() {
  const { setAuth, setAuthLoading, setAuthError } = useContext(AuthContext);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setAuthLoading(false);
      return;
    }

    let cancelled = false;
    const fetchAccount = async () => {
      try {
        const res = await apiClient.get('/api/users/account');
        if (cancelled || localStorage.getItem('access_token') !== token) return;
        if (!res?.email) throw new Error('Invalid account response');
        setAuth({
          isAuthenticated: true,
          user: {
            email: res?.email ?? "",
            username: res?.name ?? "",
            phonenumber: res?.phone ?? "",
            gender: res?.gender ?? "",
            nationality: res?.nationality ?? ""
          }
        });
        setAuthError(null);
      } catch (error) {
        if (cancelled || localStorage.getItem('access_token') !== token) return;
        setAuth({ isAuthenticated: false, user: {} });
        if (error?.response?.status === 401 || error?.response?.status === 403 || error.message === 'Invalid account response') {
          localStorage.removeItem('access_token');
          setAuthError(null);
        } else {
          setAuthError('Unable to verify your session. Please refresh to try again.');
        }
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    };
    fetchAccount();
    return () => { cancelled = true; };
  }, [setAuth, setAuthLoading, setAuthError])

  return (
    <AppRoutes />
  );
}

export default App;
