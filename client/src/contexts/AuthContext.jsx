import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuthToken } from '../services/api';

const AuthContext = createContext();

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken) {
        setAuthToken(storedToken);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          console.log('Restored user from localStorage:', parsedUser);
        } else {
          setToken(null);
          localStorage.removeItem('token');
          console.log('No user found in localStorage, clearing token.');
        }
      } else {
        console.log('No token found, user remains null.');
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const loginUser = (newToken, userData) => {
    console.log('Logging in user:', { newToken, userData });
    setToken(newToken);
    setUser({ ...userData, role: userData.role || 'user' }); // Ensure role is set
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify({ ...userData, role: userData.role || 'user' }));
    setAuthToken(newToken);

    // Check if user is admin and redirect accordingly
    const isAdmin = userData.role === 'admin' || userData.isAdmin === true;
    if (isAdmin) {
      console.log('Admin user detected, redirecting to admin/providers');
      navigate('/admin/providers');
    } else {
      console.log('Regular user logged in');
      // Optionally redirect regular users to a default route
      // navigate('/dashboard'); // Uncomment if you want to redirect regular users
    }
  };

  const logoutUser = () => {
    console.log('Logging out user...');
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
    // Redirect to login page after logout
    navigate('/login');
  };

  const userId = user?.id || null;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        userId,
        loginUser,
        logoutUser,
        loading,
      }}
    >
      {loading ? null : children} {/* Render children only after loading */}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);