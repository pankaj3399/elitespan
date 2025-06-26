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
    setUser({ ...userData, role: userData.role || 'user' });
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify({ ...userData, role: userData.role || 'user' }));
    setAuthToken(newToken);

    // Role-based routing
    const userRole = userData.role;
    const isAdmin = userData.role === 'admin';
    
    if (isAdmin) {
      console.log('Admin user detected, redirecting to admin/providers');
      navigate('/admin/providers');
    } else if (userRole === 'provider') {
      console.log('Provider user detected, redirecting to provider/profile');
      navigate('/provider/profile');
    } else {
      navigate('/user/dashboard');
      console.log('User logged in');
    }
  };

  const logoutUser = () => {
    console.log('Logging out user...');
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
    navigate('/login');
  };

  // ADD THIS FUNCTION - refreshUser to fetch updated user data
  const refreshUser = async () => {
    if (!token) {
      console.log('No token available for user refresh');
      return;
    }

    try {
      console.log('Refreshing user data...');
      setLoading(true);
      
      const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';
      
      // Fetch updated user profile
      const response = await fetch(`${BASE_URL}/api/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('User data refreshed successfully:', userData);
        
        // Update the user state with new data
        const updatedUser = { ...userData.user, role: userData.user.role || 'user' };
        setUser(updatedUser);
        
        // Update localStorage with new user data
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        console.log('User premium status updated:', updatedUser.isPremium);
        return updatedUser;
        
      } else {
        console.error('Failed to refresh user data:', response.status);
        const errorData = await response.json();
        console.error('Error details:', errorData);
        throw new Error('Failed to refresh user data');
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // Optionally handle error (logout user, show error message, etc.)
      throw error;
    } finally {
      setLoading(false);
    }
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
        refreshUser, // ADD THIS LINE - expose refreshUser function
      }}
    >
      {loading ? null : children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);