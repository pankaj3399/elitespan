import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { login } from '../services/api'; // Changed from adminLogin to login
import { toast } from 'react-toastify';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    console.log('Form submit triggered');
    console.log('Form data:', formData);

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting login with:', formData);
      const response = await login({
        email: formData.email,
        password: formData.password,
      });
      console.log('Login response:', response);

      // Check if user has admin privileges
      const user = response.user;
      const isAdmin = user.role === 'admin';

      if (!isAdmin) {
        toast.error('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      console.log('Admin user confirmed, logging in...');
      toast.success('Login successful!');
      loginUser(response.token, response.user); // Same as Navbar
    } catch (error) {
      console.error('Login error:', error);

      // Use same error handling as Navbar
      const errorMessage =
        error.message === 'Login failed' || error.message.includes('Invalid')
          ? 'Invalid credentials. Please check your email and password.'
          : 'Server error during login. Please try again.';

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className='top-0 left-0 w-screen h-screen z-50 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50'
      style={{
        margin: 0,
        padding: 0,
        width: '100vw',
        height: '100vh',
        left: 0,
        top: 0,
      }}
    >
      {/* Animated background elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse'></div>
        <div className='absolute -bottom-8 -right-4 w-72 h-72 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse animation-delay-2000'></div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse animation-delay-4000'></div>
      </div>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className='absolute w-1 h-1 bg-purple-400 rounded-full opacity-30'
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      <div className='relative z-10 w-full max-w-md px-6'>
        {/* Main login card */}
        <div className='group relative'>
          {/* Gradient border container */}
          <div className='absolute -inset-1 bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 rounded-2xl blur-sm opacity-60 group-hover:opacity-80 transition duration-1000 group-hover:duration-200 animate-pulse'></div>

          {/* Login form card */}
          <div className='relative bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-purple-200/30 shadow-xl'>
            {/* Logo/Title section */}
            <div className='text-center mb-8'>
              <div className='relative inline-block'>
                <div className='absolute -inset-2 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur opacity-60 animate-pulse'></div>
                <div className='relative bg-gradient-to-r from-purple-400 to-pink-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-transform duration-300'>
                  <svg
                    className='w-8 h-8 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                    />
                  </svg>
                </div>
              </div>
              <h2 className='text-3xl font-bold b-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                Admin Portal
              </h2>
              <p className='text-gray-600'>Secure administrative access</p>
            </div>

            {/* Login form */}
            <div className='space-y-6'>
              {/* Email field */}
              <div className='group'>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Email Address
                </label>
                <div className='relative'>
                  <div className='absolute -inset-0.5 bg-gradient-to-r from-purple-300 to-pink-300 rounded-lg opacity-0 group-hover:opacity-60 transition duration-300 blur-sm'></div>
                  <div className='relative'>
                    <input
                      type='email'
                      id='email'
                      name='email'
                      value={formData.email}
                      onChange={handleChange}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                      required
                      className='w-full px-4 py-3 bg-purple-50/50 border border-purple-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:bg-purple-100/50'
                      placeholder='admin@example.com'
                    />
                    <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                      <svg
                        className='w-5 h-5 text-gray-500'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207'
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password field */}
              <div className='group'>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Password
                </label>
                <div className='relative'>
                  <div className='absolute -inset-0.5 bg-gradient-to-r from-cyan-300 to-blue-300 rounded-lg opacity-0 group-hover:opacity-60 transition duration-300 blur-sm'></div>
                  <div className='relative'>
                    <input
                      type='password'
                      id='password'
                      name='password'
                      value={formData.password}
                      onChange={handleChange}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                      required
                      className='w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:bg-cyan-100/50'
                      placeholder='••••••••'
                    />
                    <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                      <svg
                        className='w-5 h-5 text-gray-500'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <div className='relative group'>
                <div className='absolute -inset-1 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 rounded-lg opacity-60 group-hover:opacity-80 transition duration-300 blur-sm animate-pulse'></div>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className='relative w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2'
                >
                  {loading ? (
                    <>
                      <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Log In</span>
                      <svg
                        className='w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M13 7l5 5m0 0l-5 5m5-5H6'
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(180deg);
          }
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

export default AdminLogin;
