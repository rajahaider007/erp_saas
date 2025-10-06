        import React, { useState, useEffect } from 'react';
        import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle2, Loader2, Shield, Globe, Zap, LogOut, Monitor, Smartphone, Tablet } from 'lucide-react';
        import { router } from '@inertiajs/react';
        import { usePage } from '@inertiajs/react';
        import Modal from 'react-modal';

        const LoginPage = () => {
          const { errors: pageErrors, concurrent_sessions: concurrentSessions, login_data: loginData } = usePage().props;
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
            
            console.log('Form submitted with data:', formData);
            
            if (!formData.email || !formData.password) {
              setAlert({
                type: 'error',
                message: 'Please fill in all fields'
              });
              return;
            }

            setIsLoading(true);
            setAlert(null);

            console.log('Making POST request to /login with data:', formData);

            // Test if router is available
            console.log('Router object:', router);
            console.log('Router.post method:', typeof router.post);

            try {
                router.post('/login', formData, {
                    onStart: () => {
                        console.log('Request started...');
                    },
                    onSuccess: (page) => {
                        console.log('Login success, redirecting to ERP modules...', page);
                        setAlert({
                            type: 'success',
                            message: 'Login successful! Redirecting...'
                        });
                        // Redirect to ERP modules after successful login
                        setTimeout(() => {
                            router.visit('/erp-modules');
                        }, 1000);
                    },
                    onError: (errors) => {
                        console.log('Login error:', errors);
                        setAlert({
                            type: 'error',
                            message: errors.email || errors.password || errors.general || 'Login failed'
                        });
                        setIsLoading(false);
                    },
                    onFinish: () => {
                        console.log('Request finished');
                        setIsLoading(false);
                    }
                });
            } catch (error) {
                console.error('Router error:', error);
                setAlert({
                    type: 'error',
                    message: 'Failed to submit login form'
                });
                setIsLoading(false);
            }
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
              case 'Mobile': return <Smartphone className="w-5 h-5 text-blue-400" />;
              case 'Tablet': return <Tablet className="w-5 h-5 text-purple-400" />;
              default: return <Monitor className="w-5 h-5 text-green-400" />;
            }
          };

          const AlertComponent = ({ type, message }) => {
            const isError = type === 'error';
            const Icon = isError ? AlertCircle : CheckCircle2;

            return (
              <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${isError
                ? 'bg-red-50/20 border-red-200/50 text-red-300'
                : 'bg-green-50/20 border-green-200/50 text-green-300'
                }`}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{message}</p>
              </div>
            );
          };

          return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
              {/* Concurrent Session Modal */}
              <Modal
                isOpen={isConcurrentModalOpen}
                onRequestClose={() => setIsConcurrentModalOpen(false)}
                contentLabel="Active Sessions"
                className="modal-content bg-slate-800 rounded-2xl p-6 max-w-md mx-auto border border-purple-500/30 backdrop-blur-xl"
                overlayClassName="modal-overlay fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                closeTimeoutMS={300}
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-white" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-2">Active Session Detected</h2>
                  <p className="text-purple-200 mb-6">
                    You're already logged in on another device. What would you like to do?
                  </p>
                  
                  <div className="bg-white/5 rounded-xl p-4 mb-6 max-h-60 overflow-y-auto">
                    <h3 className="text-amber-300 font-medium mb-3">Active Sessions</h3>
                    
                    <div className="space-y-3">
                      {concurrentSessions && concurrentSessions.map((session, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-amber-500/30 animate-pulse"
                        >
                          <div className="flex items-center gap-3">
                            <DeviceIcon type={session.device} />
                            <div className="text-left">
                              <p className="text-white text-sm font-medium">{session.device}</p>
                              <p className="text-xs text-slate-300">{session.ip}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs text-slate-300">Last active</p>
                            <p className="text-xs text-amber-300">{session.last_activity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => concurrentSessions.forEach(s => handleForceLogout(s.session_id))}
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout All Other Sessions
                    </button>
                    
                    <button
                      onClick={() => setIsConcurrentModalOpen(false)}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Modal>

              {/* Background elements */}
              <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
              </div>

              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full opacity-10 animate-float"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 10}s`,
                      animationDuration: `${10 + Math.random() * 20}s`
                    }}
                  ></div>
                ))}
              </div>

              <div className={`relative z-10 w-full max-w-md transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-300">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">ERP Financial Suite</h1>
                  <p className="text-purple-200">International Standard Financial Management</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-purple-200">Sign in to your account</p>
                  </div>

                  {alert && (
                    <div className="mb-6 transform animate-slideIn">
                      <AlertComponent type={alert.type} message={alert.message} />
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-purple-200">
                        Email or Login ID
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className={`h-5 w-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-purple-400' : 'text-gray-400'}`} />
                        </div>
                        <input
                          type="text"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField('')}
                          className={`block w-full pl-12 pr-4 py-4 bg-white/10 border backdrop-blur-sm rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${pageErrors?.email
                            ? 'border-red-400 focus:ring-red-500'
                            : 'border-white/20 focus:ring-purple-500 hover:border-white/30'
                            }`}
                          placeholder="Enter your email or login ID"
                          autoComplete="email"
                          required
                        />
                        {focusedField === 'email' && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 -z-10 blur-sm"></div>
                        )}
                      </div>
                      {pageErrors?.email && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1 animate-slideIn">
                          <AlertCircle className="w-4 h-4" />
                          {Array.isArray(pageErrors.email) ? pageErrors.email[0] : pageErrors.email}
                        </p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <label htmlFor="password" className="block text-sm font-medium text-purple-200">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className={`h-5 w-5 transition-colors duration-300 ${focusedField === 'password' ? 'text-purple-400' : 'text-gray-400'}`} />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField('')}
                          className={`block w-full pl-12 pr-12 py-4 bg-white/10 border backdrop-blur-sm rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${pageErrors?.password
                            ? 'border-red-400 focus:ring-red-500'
                            : 'border-white/20 focus:ring-purple-500 hover:border-white/30'
                            }`}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-400 transition-colors duration-300"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                        {focusedField === 'password' && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 -z-10 blur-sm"></div>
                        )}
                      </div>
                      {pageErrors?.password && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1 animate-slideIn">
                          <AlertCircle className="w-4 h-4" />
                          {Array.isArray(pageErrors.password) ? pageErrors.password[0] : pageErrors.password}
                        </p>
                      )}
                    </div>

                    {/* Remember Me and Forgot Password */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember_me"
                          name="remember_me"
                          type="checkbox"
                          checked={formData.remember_me}
                          onChange={handleChange}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-700"
                        />
                        <label htmlFor="remember_me" className="ml-2 block text-sm text-purple-200">
                          Remember me
                        </label>
                      </div>
                      
                      <button
                        type="button"
                        className="text-purple-300 hover:text-white text-sm font-medium transition-colors duration-300 hover:underline"
                      >
                        Forgot your password?
                      </button>
                    </div>

                    {/* Login Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
                    >
                      {isLoading && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin text-white" />
                        </div>
                      )}
                      <span className={`flex items-center justify-center gap-2 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                        <Shield className="w-5 h-5" />
                        Sign In Securely
                      </span>
                    </button>
                  </form>
                </div>

                {/* Features Section */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <Shield className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-xs text-purple-200">Bank-Grade Security</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <Globe className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-xs text-purple-200">Multi-Currency</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <Zap className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                    <p className="text-xs text-purple-200">Real-time Analytics</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-purple-200 text-sm">
                  <p>&copy; 2025 ERP Financial Suite. All rights reserved.</p>
                  <p className="mt-2">Version 1.0.0 | International Standards Compliant</p>
                </div>
              </div>

              {/* Custom styles */}
              <style jsx="true">{`
                @keyframes float {
                  0%, 100% { transform: translateY(0px) rotate(0deg); }
                  50% { transform: translateY(-20px) rotate(180deg); }
                }
                
                @keyframes slideIn {
                  from {
                    opacity: 0;
                    transform: translateY(-10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                
                .animate-float {
                  animation: float 20s infinite linear;
                }
                
                .animate-slideIn {
                  animation: slideIn 0.3s ease-out;
                }
                
                .animation-delay-2000 {
                  animation-delay: 2s;
                }
                
                .animation-delay-4000 {
                  animation-delay: 4s;
                }
              `}</style>
            </div>
          );
        };

        export default LoginPage;