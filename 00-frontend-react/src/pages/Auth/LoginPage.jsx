import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Home, Lock, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '@/components/ui/Button';
import { AuthContext } from '@/contexts/AuthContext';
import apiClient from '@/services/apiClient';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
  const { setAuth, setAuthLoading, setAuthError } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!emailPattern.test(email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!password) nextErrors.password = 'Enter your password.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsLoading(true);
    try {
      const res = await apiClient.post('/api/login', { email: email.trim().toLowerCase(), password });
      if (!res.success || !res.access_token) throw new Error(res?.msg || res?.message || 'Login failed');

      localStorage.setItem('access_token', res.access_token);
      setAuth({
        isAuthenticated: true,
        user: {
          email: res?.user?.email ?? '',
          username: res?.user?.name ?? '',
          phonenumber: res?.user?.phone ?? '',
          gender: res?.user?.gender ?? '',
          nationality: res?.user?.nationality ?? '',
        },
      });
      setAuthError(null);
      setAuthLoading(false);
      toast.success('Welcome back to Linglooma.');
      navigate('/admin/dashboard');
    } catch (error) {
      const message = error?.response?.data?.msg || error?.response?.data?.message || error.message || 'We couldn’t sign you in. Please try again.';
      setErrors({ form: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:flex sm:items-center sm:justify-center sm:py-12">
      <div className="mx-auto w-full max-w-md">
        <Link to="/" className="mx-auto flex w-fit items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm"><Home className="h-5 w-5" aria-hidden="true" /></span>
          Linglooma
        </Link>

        <div className="mt-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Sign in to continue your IELTS practice.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" noValidate>
          {errors.form && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{errors.form}</div>}

          <div>
            <label htmlFor="email" className="form-label">Email address</label>
            <div className="relative">
              <Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input id="email" name="email" type="email" autoComplete="email" className="form-control pl-11" placeholder="you@example.com" value={email} onChange={(event) => { setEmail(event.target.value); setErrors(current => ({ ...current, email: undefined, form: undefined })); }} disabled={isLoading} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
            </div>
            {errors.email && <p id="email-error" className="form-error">{errors.email}</p>}
          </div>

          <div className="mt-5">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="relative">
              <Lock aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" className="form-control pl-11 pr-12" placeholder="Enter your password" value={password} onChange={(event) => { setPassword(event.target.value); setErrors(current => ({ ...current, password: undefined, form: undefined })); }} disabled={isLoading} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} />
              <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p id="password-error" className="form-error">{errors.password}</p>}
          </div>

          <Button type="submit" isLoading={isLoading} className="mt-6 w-full">{isLoading ? 'Signing in…' : 'Sign in'}</Button>

          <p className="mt-5 text-center text-sm text-slate-600">
            Don’t have an account? <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">Create one</Link>
          </p>
        </form>
      </div>
    </main>
  );
};

export default LoginPage;
