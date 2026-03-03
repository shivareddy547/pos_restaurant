// ⚠️ CRITICAL: This is an EXISTING file. Only modify what is necessary.
// Component name: 'Signup'
// DO NOT remove or change existing working code
// DO NOT rewrite this file from scratch
// Only add/update code to implement new requirements
// Preserve all existing imports, exports, and structure

// EXISTING CONTENT (do not delete any of this):
// ⚠️ MODIFY existing component - add new functionality
// Preserve all existing imports and code
// Add new imports at bottom
// Add new state/variables after existing
// Add new functions after existing
// Add new JSX while preserving layout
// Maintain existing styling
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ----------------------------------------
// New constant for API base URL
// ----------------------------------------
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const Signup: React.FC = () => {
  const [method, setMethod] = useState<'email' | 'mobile'>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mobileStep, setMobileStep] = useState(1);
  // New phone state (with +91 country code)
  const [phone, setPhone] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  // -------------------------------------------------
  // Existing email signup handler – now integrated with real API
  // -------------------------------------------------
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate phone number if provided
    if (phone && phone.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setIsLoading(true);

    try {
      // -------------------------------------------------
      // Build request payload matching backend expectations
      // -------------------------------------------------
      const payload = {
        auth: {
          email,
          password,
          password_confirmation: confirmPassword,
          name,
          // send phone only if user entered it, prefixed with +91
          ...(phone ? { phone_number: `+91${phone}` } : {})
        }
      };

      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        // Backend usually returns an errors object or message
        const msg = data?.error || data?.message || 'Signup failed';
        setError(msg);
        return;
      }

      // If the API returns a user object or token we could store it,
      // but for now we just show the success UI (maintains existing UX)
      setShowSuccess(true);
      setTimeout(() => navigate('/login'), 2000);

      // Optional: keep the context's signup flow for future mock usage
      // await signup(email, password, name);

    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMobileSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // -------------------------------------------------
      // Integrate API here as per curl example requirements
      // -------------------------------------------------
      const payload = {
        auth: {
          phone_number: `+91${mobile}`
        }
      };

      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data?.error || data?.message || 'Failed to send OTP';
        setError(msg);
        return;
      }

      // Move to OTP verification step on success
      setMobileStep(2);
    } catch (err) {
      setError('Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------
  // MODIFIED: Verify OTP - Integrated with API
  // -------------------------------------------------
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const enteredOtp = otp.join('');
      const fullPhoneNumber = `+91${mobile}`;

      // API Integration for Verify OTP
      const response = await fetch(`${API_URL}/auth/verify_otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          phone_number: fullPhoneNumber,
          otp: enteredOtp
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data?.error || data?.message || 'Invalid OTP. Please try again.';
        setError(msg);
        return;
      }

      // Success: Show success message and redirect
      setShowSuccess(true);
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred during verification.');
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

  const handleMethodChange = (newMethod: 'email' | 'mobile') => {
    setMethod(newMethod);
    setError('');
    setMobileStep(1);
    setMobile('');
    setOtp(['', '', '', '', '', '']);
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
          <h2 className="text-2xl font-bold text-gray-900">Signup Successful!</h2>
          <p className="text-gray-600 mt-2">Redirecting to login...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
              <span className="text-3xl">🍽️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Join our restaurant POS system</p>
          </div>
          
          {/* Method Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => handleMethodChange('email')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                method === 'email' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => handleMethodChange('mobile')}
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
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your name"
                  required
                />
              </div>
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
              {/* New Phone Number Input with +91 country code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600 font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\\D/g, '').slice(0, 10))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone number"
                    maxLength={10}
                    required={false}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Create a password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          ) : (
            <>
              {/* Step Indicator */}
              <div className="flex items-center justify-center mb-6">
                <div className={`flex items-center ${mobileStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    mobileStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    {mobileStep > 1 ? '✓' : '1'}
                  </div>
                  <span className="ml-2 text-sm font-medium">Mobile</span>
                </div>
                <div className={`w-12 h-0.5 mx-2 ${mobileStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${mobileStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    mobileStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium">Verify</span>
                </div>
              </div>

              {mobileStep === 1 ? (
                <form onSubmit={handleMobileSignup} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600 font-medium">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\\D/g, '').slice(0, 10))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter mobile number"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || mobile.length !== 10}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verify Mobile Number</label>
                    <p className="text-gray-600 mb-3">OTP sent to <span className="font-semibold text-gray-900">+91 {mobile}</span></p>
                    <button
                      type="button"
                      onClick={() => setMobileStep(1)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Change Mobile Number
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
                          className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          maxLength={1}
                          required
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center">Enter the OTP received on your mobile</p>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || otp.join('').length !== 6}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Sign Up'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setIsLoading(true);
                      setTimeout(() => {
                        setIsLoading(false);
                      }, 1000);
                    }}
                    className="w-full text-blue-600 hover:text-blue-700 py-2 text-sm font-medium"
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                </form>
              )}
            </>
          )}
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
