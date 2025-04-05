import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminLogin } from '../services/api';
import { X } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { token, user, loginUser, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    console.log('ProtectedRoute useEffect:', { token, user, loading });
    if (loading) return; // Wait for AuthContext to finish loading

    if (!token || !user) {
      console.log('No token or user, opening login modal.');
      setIsAdminLoginOpen(true);
    } else if (user && user.role !== 'admin') {
      console.log('User is not an admin, redirecting to /');
      navigate('/');
    } else {
      console.log('User is an admin, allowing access.');
      setIsAdminLoginOpen(false);
    }
  }, [token, user, loading, navigate]);

  const handleAdminLoginChange = (e) => {
    const { name, value } = e.target;
    setAdminCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
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
    }
  };

  const handleCloseModal = () => {
    console.log('Closing login modal, redirecting to /');
    setIsAdminLoginOpen(false);
    navigate('/');
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading state while AuthContext initializes
  }

  if (!token || !user || (user && user.role !== 'admin')) {
    if (isAdminLoginOpen || (!token && !user)) {
      return (
        <div className="fixed inset-0 backdrop-blur-md bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-lg relative max-w-sm w-full mx-4">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-semibold text-[#0B0757] mb-8">Admin Login</h2>

            <form onSubmit={handleAdminLoginSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 text-sm">Email</label>
                <input
                  type="email"
                  name="email"
                  value={adminCredentials.email}
                  onChange={handleAdminLoginChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]"
                  placeholder="Admin Email"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-gray-700 text-sm">Password</label>
                <input
                  type="password"
                  name="password"
                  value={adminCredentials.password}
                  onChange={handleAdminLoginChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]"
                  placeholder="Password"
                  required
                />
              </div>

              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}

              <button
                type="submit"
                className="w-full py-3 bg-[#0B0757] text-white rounded-full font-medium text-base mt-4"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      );
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;