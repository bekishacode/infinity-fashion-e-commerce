import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await adminService.forgotPassword(email);
      if (result.success) {
        setMessage({ type: 'success', text: 'OTP sent to your email. Please check your inbox.' });
        setStep('otp');
        setResendTimer(60); // Start 60 second countdown
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to send OTP' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setResendLoading(true);
    setMessage(null);

    try {
      const result = await adminService.forgotPassword(email);
      if (result.success) {
        setMessage({ type: 'success', text: 'OTP resent to your email!' });
        setResendTimer(60);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to resend OTP' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await adminService.verifyOtp(email, otp);
      if (result.success) {
        setMessage({ type: 'success', text: 'OTP verified successfully!' });
        setResetToken(result.data.reset_token);
        setStep('reset');
      } else {
        setMessage({ type: 'error', text: result.message || 'Invalid OTP' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await adminService.resetPassword(email, resetToken, newPassword);
      if (result.success) {
        setMessage({ type: 'success', text: 'Password reset successfully! Redirecting to login...' });
        setTimeout(() => navigate('/admin/login'), 2000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to reset password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-royal-blue to-magenta rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">SB</span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal">Forgot Password</h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === 'email' && 'Enter your email to receive OTP'}
            {step === 'otp' && 'Enter the OTP sent to your email'}
            {step === 'reset' && 'Create a new password'}
          </p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          }`}>
            {message.text}
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleSendOtp}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                placeholder="admin@example.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-royal-blue text-white py-2 rounded-lg hover:bg-royal-blue-dark disabled:opacity-50 transition"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">OTP Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-400 mt-1">OTP expires in 15 minutes</p>
            </div>
            
            {/* Resend Button with Timer */}
            <div className="flex gap-3 mb-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-royal-blue text-white py-2 rounded-lg hover:bg-royal-blue-dark disabled:opacity-50 transition"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || resendLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition text-sm"
              >
                {resendLoading ? 'Sending...' : resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                placeholder="Min 6 characters"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                placeholder="Confirm your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-royal-blue text-white py-2 rounded-lg hover:bg-royal-blue-dark disabled:opacity-50 transition"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link to="/admin/login" className="text-royal-blue hover:underline text-sm">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;