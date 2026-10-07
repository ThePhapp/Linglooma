import { useContext, useState } from 'react';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const clearMessages = () => {
    setErrors(current => ({ ...current, email: undefined, password: undefined, form: undefined }));
    setInfoMessage('');
  };

  const handleSubmit = async event => {
    event.preventDefault();
    const nextErrors = {};
    if (!emailPattern.test(email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!password) nextErrors.password = 'Enter your password.';
    setErrors(nextErrors);
    setInfoMessage('');
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
      <div className="w-full max-w-md">
        <Link to="/" className="mx-auto flex w-fit items-center gap-2.5 rounded-xl text-sm font-semibold text-slate-700 transition-colors hover:text-brand-700">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-base tracking-tight text-slate-950">Linglooma</span>
        </Link>

        <section className="mt-7 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <header>
            <p className="text-sm font-medium text-brand-700">Your IELTS workspace</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Welcome back</h1>
            <p className="mt-2 text-sm leading-6 text-pretty text-slate-600">Sign in to continue your IELTS practice.</p>
          </header>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
            {errors.form && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">{errors.form}</div>}

            <div className="space-y-1.5">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                className={`form-control h-12 min-h-12 rounded-xl text-base md:text-sm ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
                placeholder="Enter your email"
                value={email}
                onChange={event => { setEmail(event.target.value); clearMessages(); }}
                disabled={isLoading}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              <p id="email-error" className="min-h-4 text-xs text-red-600">{errors.email}</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="password" className="form-label mb-0">Password</label>
                <button
                  type="button"
                  className="relative inline-flex min-h-8 items-center rounded-lg px-1 text-sm text-slate-700 underline-offset-4 hover:text-slate-950 hover:underline"
                  onClick={() => setInfoMessage('Password recovery will be available when the reset flow is connected.')}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`form-control h-12 min-h-12 rounded-xl pr-12 text-base md:text-sm ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={event => { setPassword(event.target.value); clearMessages(); }}
                  disabled={isLoading}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(value => !value)}
                  className="absolute inset-y-0 right-1 my-auto flex size-10 items-center justify-center rounded-lg text-slate-500 hover:text-slate-950"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
              <p id="password-error" className="min-h-4 text-xs text-red-600">{errors.password}</p>
            </div>

            {infoMessage && <p role="status" className="-mt-1 text-sm leading-5 text-slate-600">{infoMessage}</p>}

            <Button type="submit" isLoading={isLoading} className="min-h-12 w-full rounded-xl shadow-none">
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>

            <div className="flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">or</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="min-h-12 w-full rounded-xl shadow-none"
              onClick={() => setInfoMessage('Google sign-in will be available after the provider is configured.')}
            >
              Continue with Google
            </Button>

            <p className="text-center text-sm text-slate-600">
              Don’t have an account? <Link to="/register" className="font-semibold text-brand-700 underline-offset-4 hover:text-brand-800 hover:underline">Create one</Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
