import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminLogin } from '../services/api';
import { X, LogOut } from 'lucide-react';

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ children, redirectAction }) => {
  const { token, user, loginUser, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('ProtectedRoute useEffect:', { token, user, loading });
    if (loading) return;

    if (!token || !user) {
      console.log('No token or user, opening login modal.');
      setIsAdminLoginOpen(true);
      if (redirectAction) redirectAction();
    } else if (user && user.role !== 'admin') {
      console.log('User is not an admin, redirecting to /');
      navigate('/');
      if (redirectAction) redirectAction();
    } else {
      console.log('User is an admin, allowing access.');
      setIsAdminLoginOpen(false);
    }
  }, [token, user, loading, navigate, redirectAction]);

  const handleAdminLoginChange = (e) => {
    const { name, value } = e.target;
    setAdminCredentials((prev) => ({ ...prev, [name]: value }));
    if (loginError) setLoginError('');
  };

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      console.log('Attempting admin login with credentials:', adminCredentials);
      const response = await adminLogin(adminCredentials);
      const userData = { ...response.admin, id: response.admin._id || response.admin.id, role: 'admin' };
      console.log('Admin login successful, userData:', userData);
      loginUser(response.token, userData);
      setIsAdminLoginOpen(false);
      setLoginError('');
    } catch (error) {
      setLoginError('Invalid admin credentials. Please try again or contact support.');
      console.error('Admin login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    console.log('Closing login modal, redirecting to /');
    setIsAdminLoginOpen(false);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-4 border-indigo-800 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token || !user || (user && user.role !== 'admin')) {
    if (isAdminLoginOpen || (!token && !user)) {
      return (
        <div className="fixed inset-0 backdrop-blur-xs bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-900 to-blue-700 p-6 relative">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex justify-center mb-2">
                <div className="bg-white/20 rounded-lg p-2">
                  <LogOut className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-white text-center">Admin Portal</h2>
              <p className="text-blue-100 text-center text-sm mt-1">Please sign in to continue</p>
            </div>

            {/* Form */}
            <div className="p-6">
              <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={adminCredentials.email}
                      onChange={handleAdminLoginChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={adminCredentials.password}
                      onChange={handleAdminLoginChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-indigo-900 to-blue-700 text-white rounded-lg font-medium text-base mt-2 hover:shadow-lg transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Signing In...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-6">
                Access restricted to authorized administrators only
              </p>
            </div>
          </div>
        </div>
      );
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;