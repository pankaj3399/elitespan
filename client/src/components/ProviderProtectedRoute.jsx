// client/src/components/ProviderProtectedRoute.jsx
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// eslint-disable-next-line react/prop-types
const ProviderProtectedRoute = ({ children, redirectAction }) => {
  const { token, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('ProviderProtectedRoute useEffect:', { token, user, loading });
    
    if (loading) return;

    if (!token || !user) {
      console.log('No token or user, redirecting to home with login modal');
      if (redirectAction) redirectAction();
      navigate('/');
      return;
    }

    if (user.role !== 'provider') {
      console.log('User is not a provider, redirecting to home');
      if (redirectAction) redirectAction();
      navigate('/');
      return;
    }

    console.log('User is a provider, allowing access');
  }, [token, user, loading, navigate, redirectAction]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#FCF8F4]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-4 border-[#0C1F6D] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== 'provider') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProviderProtectedRoute;