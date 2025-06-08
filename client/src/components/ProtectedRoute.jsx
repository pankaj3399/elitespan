import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ children, redirectAction }) => {
  const { token, user, loading } = useAuth();

  useEffect(() => {
    console.log('ProtectedRoute useEffect:', { 
      token: !!token, 
      user, 
      userRole: user?.role,
      loading 
    });
    
    if (loading) return;

    if (!token || !user) {
      console.log('No token or user, redirecting and showing error toast.');
      if (redirectAction) redirectAction();
      // Don't open modal, just redirect
    } else {
      // Allow access for both 'user' and 'admin' roles
      console.log('User is authenticated with role:', user.role, '- allowing access.');
    }
  }, [token, user, loading, redirectAction]);

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

  // Check if user is authenticated (allow both 'user' and 'admin' roles)
  if (!token || !user) {
    console.log('User not authenticated, redirecting to home with error toast.');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;