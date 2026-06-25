import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../utils/apiClient';
import { LoginResponse } from '../../types/api.types';
import { Eye, EyeOff, Lock, Mail, Shield, Sparkles } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Load saved username if remember me was checked
  useEffect(() => {
    const savedUsername = localStorage.getItem('admin_username');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await apiClient.post<LoginResponse>('/admin/login', { username, password });
      
      if (result.success && result.data) {
        localStorage.setItem('admin_token', result.data.token);
        localStorage.setItem('admin_info', JSON.stringify(result.data.admin));
        
        if (rememberMe) {
          localStorage.setItem('admin_username', username);
        } else {
          localStorage.removeItem('admin_username');
        }
        
        navigate('/admin/dashboard');
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Decorative grid pattern - simplified */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-royal-blue via-purple-500 to-magenta rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-purple-200">Sign in to your admin account</p>
        </div>

        {/* Login card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 animate-fade-in-up">
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-medium text-white mb-2">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-purple-300" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent transition-all"
                  placeholder="admin@stylebadge.com"
                  required
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-purple-300" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-purple-300 hover:text-white transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-purple-300 hover:text-white transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 bg-white/10 border-white/20 rounded focus:ring-royal-blue"
                />
                <span className="ml-2 text-sm text-purple-200">Remember me</span>
              </label>
              <Link
                to="/admin/forgot-password"
                className="text-md text-green hover:text-white font-semibold transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full bg-green text-white py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
            >
              <span className="relative z-10">
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </span>
              <div className="absolute inset-0 text-white bg-green-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/20 text-center">
            <p className="text-sm text-purple-200">
              Secure admin access only
            </p>
            <div className="flex items-center justify-center mt-3 space-x-2">
              <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
              <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
              <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;