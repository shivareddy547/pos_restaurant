import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import mockAuthService from '../services/mockAuthService';

const ForgotPassword: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [method, setMethod] = useState<'email' | 'mobile'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await mockAuthService.initiatePasswordReset(identifier);
      if (result.success) {
        setIsOtpSent(true);
        // In real app, you'd wait for OTP input here, but for mock flow, redirect to reset
        setTimeout(() => {
          navigate('/reset-password');
        }, 1500);
      } else {
        setError(result.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-600 mt-2">
            {isOtpSent ? 'OTP Sent Successfully' : 'Enter your email or mobile to reset password'}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}
        
        {isOtpSent && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6 text-sm">
            Redirecting to reset page...
          </div>
        )}
        
        {!isOtpSent && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                type="button"
                onClick={() => { setMethod('email'); setIdentifier(''); }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  method === 'email' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => { setMethod('mobile'); setIdentifier(''); }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  method === 'mobile' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Mobile
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {method === 'email' ? 'Email Address' : 'Mobile Number'}
              </label>
              <input
                type={method === 'email' ? 'email' : 'tel'}
                value={identifier}
                onChange={(e) => setIdentifier(method === 'mobile' ? e.target.value.replace(/\D/g, '') : e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={method === 'email' ? 'Enter your email' : 'Enter mobile number'}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}
        
        <div className="mt-8 text-center">
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
