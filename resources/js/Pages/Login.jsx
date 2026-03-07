import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle2, Loader2, LogOut, Monitor, Smartphone, Tablet } from 'lucide-react';
import { router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import Modal from 'react-modal';
import LoginHeroAnimation from '@/Components/LoginHeroAnimation';

const LoginPage = () => {
  const { errors: pageErrors, concurrent_sessions: concurrentSessions } = usePage().props;
  const [formData, setFormData] = useState({
    email: 'admin@erpsystem.com',
    password: '',
    remember_me: false,
    terminate_other_sessions: false
  });

  const [isConcurrentModalOpen, setIsConcurrentModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  useEffect(() => {
    setIsVisible(true);
    if (window.dispatchEvent) {
      window.dispatchEvent(new Event('react-app-loaded'));
    }
  }, []);

  // When opening login (e.g. after logout), ensure dark class is removed so form text stays readable.
  // Otherwise theme from previous page leaves document.documentElement with "dark" and text turns white.
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    return () => { /* no need to restore; next page sets its own theme */ };
  }, []);

  useEffect(() => {
    if (concurrentSessions && concurrentSessions.length > 0) {
      setIsConcurrentModalOpen(true);
    }
  }, [concurrentSessions]);

  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      setAlert({
        type: 'error',
        message: pageErrors.email || pageErrors.password || pageErrors.general || 'Login failed'
      });
    }
  }, [pageErrors]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setAlert(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setAlert({ type: 'error', message: 'Please fill in all fields' });
      return;
    }
    setIsLoading(true);
    setAlert(null);
    router.post('/login', formData, {
      onSuccess: () => {
        // Server returns redirect to /erp-modules; Inertia follows it, so no client visit needed.
        // Avoids double load and ensures first load of Modules page is interactive.
      },
      onError: (errors) => {
        setAlert({
          type: 'error',
          message: errors.email || errors.password || errors.general || 'Login failed'
        });
        setIsLoading(false);
      },
      onFinish: () => setIsLoading(false)
    });
  };

  const handleForceLogout = (sessionId) => {
    router.post('/force-logout', {
      session_id: sessionId,
      login_data: formData
    }, {
      onSuccess: () => {
        setIsConcurrentModalOpen(false);
        setFormData(prev => ({ ...prev, terminate_other_sessions: true }));
        handleSubmit(new Event('submit'));
      }
    });
  };

  const DeviceIcon = ({ type }) => {
    switch (type) {
      case 'Mobile': return <Smartphone className="w-5 h-5 text-slate-500" />;
      case 'Tablet': return <Tablet className="w-5 h-5 text-slate-500" />;
      default: return <Monitor className="w-5 h-5 text-slate-500" />;
    }
  };

  const AlertComponent = ({ type, message }) => {
    const isError = type === 'error';
    const Icon = isError ? AlertCircle : CheckCircle2;
    return (
      <div
        className={`flex items-center gap-3 p-4 rounded-xl border ${
          isError
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between bg-slate-900 text-white p-12 xl:p-16 relative overflow-hidden"
        style={{ fontFamily: 'Fraunces, serif' }}
      >
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 text-white mb-10">
            <span className="text-xl font-bold tracking-tight">E</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-semibold tracking-tight text-white leading-tight max-w-md">
            ERP Financial Suite
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-sm font-sans" style={{ fontFamily: 'Figtree, sans-serif' }}>
            International standard financial management. One place for accounts, inventory, and reporting.
          </p>
        </div>
        {/* Hero animation: robot, chips, factory */}
        <div className="relative z-10 flex-1 min-h-[200px] flex items-center justify-center">
          <LoginHeroAnimation />
        </div>
        {/* Minimal grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, white 1px, transparent 1px),
                linear-gradient(to bottom, white 1px, transparent 1px)
              `,
              backgroundSize: '64px 64px'
            }}
          />
        </div>
        <div className="relative z-10 pt-8 border-t border-white/10">
          <p className="text-sm text-slate-500 font-sans" style={{ fontFamily: 'Figtree, sans-serif' }}>
            Secure sign-in · Your data stays in your control
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div
          className={`w-full max-w-[400px] transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          style={{ fontFamily: 'Figtree, sans-serif' }}
        >
          <div className="lg:hidden mb-8">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-900 text-white text-sm font-bold mb-4">E</div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-900">ERP Financial Suite</h1>
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">Sign in to continue</p>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 dark:text-slate-500 text-sm mb-8">Sign in with your email and password.</p>

          {alert && (
            <div className="mb-6 animate-[slideIn_0.25s_ease-out]">
              <AlertComponent type={alert.type} message={alert.message} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-700 mb-1.5">
                Email or login ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className={`h-5 w-5 transition-colors ${focusedField === 'email' ? 'text-indigo-500' : ''}`} />
                </div>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  className={`block w-full pl-11 pr-4 py-3 rounded-xl border bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${
                    pageErrors?.email
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 hover:border-slate-300'
                  }`}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
                {pageErrors?.email && (
                  <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {Array.isArray(pageErrors.email) ? pageErrors.email[0] : pageErrors.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className={`h-5 w-5 transition-colors ${focusedField === 'password' ? 'text-indigo-500' : ''}`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  className={`block w-full pl-11 pr-12 py-3 rounded-xl border bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${
                    pageErrors?.password
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 hover:border-slate-300'
                  }`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {pageErrors?.password && (
                  <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {Array.isArray(pageErrors.password) ? pageErrors.password[0] : pageErrors.password}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  checked={formData.remember_me}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-600 dark:text-slate-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm font-medium text-indigo-600 dark:text-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-500 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} ERP Financial Suite
          </p>
        </div>
      </div>

      {/* Concurrent session modal */}
      <Modal
        isOpen={isConcurrentModalOpen}
        onRequestClose={() => setIsConcurrentModalOpen(false)}
        contentLabel="Active sessions"
        className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto border border-slate-200"
        overlayClassName="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        closeTimeoutMS={200}
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-600 mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Active session detected</h2>
          <p className="text-slate-600 text-sm mb-6">
            You're already signed in on another device. Log out other sessions or continue here.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 mb-6 max-h-52 overflow-y-auto space-y-3">
            {concurrentSessions && concurrentSessions.map((session, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 text-left"
              >
                <div className="flex items-center gap-3">
                  <DeviceIcon type={session.device} />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{session.device}</p>
                    <p className="text-xs text-slate-500">{session.ip}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Last active</p>
                  <p className="text-xs font-medium text-slate-700">{session.last_activity}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => concurrentSessions.forEach(s => handleForceLogout(s.session_id))}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Log out all other sessions
            </button>
            <button
              onClick={() => setIsConcurrentModalOpen(false)}
              className="w-full py-3 px-4 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
