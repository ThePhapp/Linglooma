import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Eye, EyeOff, Home, Lock, Mail, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '@/components/ui/Button';
import apiClient from '@/services/apiClient';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const requirements = [
    { label: '8–128 characters', met: [...password].length >= 8 && [...password].length <= 128 },
    { label: 'Uppercase and lowercase letters', met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: 'A number', met: /\d/.test(password) },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!emailPattern.test(email.trim())) nextErrors.email = 'Enter a valid email address.';
    if ([...password].length < 8 || [...password].length > 128) nextErrors.password = 'Use between 8 and 128 characters.';
    if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsLoading(true);
    try {
      const res = await apiClient.post('/api/register', { email: email.trim().toLowerCase(), password });
      if (!res.success) throw new Error(res?.msg || res?.message || 'Registration failed');
      toast.success('Account created. Sign in to continue.');
      navigate('/login');
    } catch (error) {
      setErrors({ form: error?.response?.data?.msg || error?.response?.data?.message || error.message || 'We couldn’t create your account. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-md">
        <Link to="/" className="mx-auto flex w-fit items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm"><Home className="h-5 w-5" aria-hidden="true" /></span>
          Linglooma
        </Link>

        <div className="mt-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Create your account</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Set up your account and start practicing.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" noValidate>
          {errors.form && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{errors.form}</div>}

          <div>
            <label htmlFor="register-email" className="form-label">Email address</label>
            <div className="relative">
              <Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input id="register-email" name="email" type="email" autoComplete="email" className="form-control pl-11" placeholder="you@example.com" value={email} onChange={(event) => { setEmail(event.target.value); setErrors(current => ({ ...current, email: undefined, form: undefined })); }} disabled={isLoading} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'register-email-error' : undefined} />
            </div>
            {errors.email && <p id="register-email-error" className="form-error">{errors.email}</p>}
          </div>

          <div className="mt-5">
            <label htmlFor="register-password" className="form-label">Password</label>
            <div className="relative">
              <Lock aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input id="register-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" className="form-control pl-11 pr-12" placeholder="Create a password" value={password} onChange={(event) => { setPassword(event.target.value); setErrors(current => ({ ...current, password: undefined, form: undefined })); }} maxLength={128} disabled={isLoading} aria-invalid={Boolean(errors.password)} aria-describedby="password-requirements" />
              <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100" aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password}</p>}
            <ul id="password-requirements" className="mt-3 grid gap-1.5 text-xs text-slate-600" aria-label="Password requirements">
              {requirements.map(requirement => (
                <li key={requirement.label} className={`flex items-center gap-2 ${requirement.met ? 'text-emerald-700' : ''}`}>
                  {requirement.met ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <X className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />}
                  {requirement.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5">
            <label htmlFor="confirm-password" className="form-label">Confirm password</label>
            <div className="relative">
              <Lock aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input id="confirm-password" name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" className="form-control pl-11" placeholder="Repeat your password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setErrors(current => ({ ...current, confirmPassword: undefined, form: undefined })); }} maxLength={128} disabled={isLoading} aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined} />
            </div>
            {errors.confirmPassword && <p id="confirm-password-error" className="form-error">{errors.confirmPassword}</p>}
          </div>

          <Button type="submit" isLoading={isLoading} className="mt-6 w-full">{isLoading ? 'Creating account…' : 'Create account'}</Button>

          <p className="mt-5 text-center text-sm text-slate-600">
            Already have an account? <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">Sign in</Link>
          </p>
        </form>
      </div>
    </main>
  );
};

export default RegisterPage;
