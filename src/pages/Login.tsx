import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MOCK_CREDENTIALS } from '../services/mockAuthService';

const Login: React.FC = () => {
  const [method, setMethod] = useState<'email' | 'mobile'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [otpStep, setOtpStep] = useState<'mobile' | 'otp'>('mobile');
  
  const { login, loginWithMobile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';
  
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => navigate(from, { replace: true }), 500);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!mobile || mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    if (mobile !== MOCK_CREDENTIALS.mobile) {
      setError('Invalid mobile number. Use test credentials.');
      return;
    }
    
    setOtpStep('otp');
  };
  
  const handleMobileLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const otpValue = otp.join('');
    
    if (otpValue !== MOCK_CREDENTIALS.otp) {
      setError('Invalid OTP. Use test credentials.');
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await loginWithMobile(mobile, otpValue);
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => navigate(from, { replace: true }), 500);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      const input = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      input?.focus();
    }
  };
  
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const input = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      input?.focus();
    }
  };
  
  const handleBackToMobile = () => {
    setOtpStep('mobile');
    setOtp(['', '', '', '', '', '']);
    setError('');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {showSuccess ? (
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Login Successful!</h2>
          <p className="text-gray-600 mt-2">Redirecting...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
              <span className="text-3xl">🍽️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">🔑 Test Credentials</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p><span className="font-medium">Email:</span> {MOCK_CREDENTIALS.email}</p>
              <p><span className="font-medium">Password:</span> {MOCK_CREDENTIALS.password}</p>
              <p><span className="font-medium">Mobile:</span> {MOCK_CREDENTIALS.mobile}</p>
              <p><span className="font-medium">OTP:</span> {MOCK_CREDENTIALS.otp}</p>
            </div>
          </div>
          
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => { setMethod('email'); setError(''); }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                method === 'email' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => { setMethod('mobile'); setError(''); setOtpStep('mobile'); setOtp(['', '', '', '', '', '']); }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                method === 'mobile' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              Mobile
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}
          
          {method === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Forgot Password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={otpStep === 'mobile' ? handleSendOtp : handleMobileLogin} className="space-y-6">
              {otpStep === 'mobile' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      placeholder="Enter mobile number"
                      maxLength={10}
                      required
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-2">Enter your 10-digit mobile number</p>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    {isLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <p className="text-gray-600">
                      OTP sent to <span className="font-semibold text-gray-900">+91 {mobile}</span>
                    </p>
                    <button
                      type="button"
                      onClick={handleBackToMobile}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1"
                    >
                      Change number
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Enter OTP</label>
                    <div className="flex gap-2 justify-center">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          maxLength={1}
                          required
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Login'}
                  </button>
                </>
              )}
            </form>
          )}
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </Link>
            </p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500 mb-4">Or continue with</p>
            <div className="grid grid-cols-3 gap-3">
              <button disabled className="flex items-center justify-center py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 text-sm font-medium cursor-not-allowed">
                Google
              </button>
              <button disabled className="flex items-center justify-center py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 text-sm font-medium cursor-not-allowed">
                Facebook
              </button>
              <button disabled className="flex items-center justify-center py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 text-sm font-medium cursor-not-allowed">
                Twitter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
