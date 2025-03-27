import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api';

console.log('API BASE_URL:', BASE_URL); // Debug log to confirm BASE_URL

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.Authorization;
  }
};

export const signup = async (userData) => {
  try {
    const response = await api.post('/users/signup', userData);
    return response.data;
  } catch (error) {
    console.error('Signup error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Signup failed');
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/users/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const updateProfile = async (token, profileData) => {
  try {
    setAuthToken(token);
    const response = await api.put('/users/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Profile update failed');
  }
};

export const editProfile = async (token, profileData) => {
  try {
    setAuthToken(token);
    const response = await api.put('/users/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Edit profile error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Profile update failed');
  }
};

export const getDoctors = async (filters) => {
  try {
    const query = new URLSearchParams(filters).toString();
    const response = await api.get(`/doctors?${query}`);
    return response.data;
  } catch (error) {
    console.error('Get doctors error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch doctors');
  }
};

// Doctor Endpoints
export const doctorSignup = async (doctorData) => {
  try {
    const response = await api.post('/doctors/signup', doctorData);
    return response.data;
  } catch (error) {
    console.error('Doctor signup error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Doctor signup failed');
  }
};

export const doctorLogin = async (credentials) => {
  try {
    const response = await api.post('/doctors/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Doctor login error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Doctor login failed');
  }
};

export const updateDoctorProfile = async (token, profileData) => {
  try {
    setAuthToken(token);
    const response = await api.put('/doctors/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Update doctor profile error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Doctor profile update failed');
  }
};

export const getDoctorProfile = async (token) => {
  try {
    setAuthToken(token);
    const response = await api.get('/doctors/profile');
    return response.data;
  } catch (error) {
    console.error('Get doctor profile error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch doctor profile');
  }
};

// Admin Endpoints
export const adminSignup = async (adminData) => {
  try {
    const response = await api.post('/admins/signup', adminData);
    return response.data;
  } catch (error) {
    console.error('Admin signup error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Admin signup failed');
  }
};

export const adminLogin = async (credentials) => {
  try {
    const response = await api.post('/admins/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Admin login error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Admin login failed');
  }
};

export const updateDoctorApproval = async (token, approvalData) => {
  try {
    setAuthToken(token);
    const response = await api.put('/admins/doctors/approve', approvalData);
    return response.data;
  } catch (error) {
    console.error('Update doctor approval error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Doctor approval update failed');
  }
};

export const getAllDoctors = async (token) => {
  try {
    setAuthToken(token);
    const response = await api.get('/admins/doctors');
    return response.data;
  } catch (error) {
    console.error('Get all doctors error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch all doctors');
  }
};

// Payment Endpoints
export const createPaymentIntent = async (token, paymentData) => {
  try {
    setAuthToken(token);
    console.log('Sending createPaymentIntent request:', { token: token.substring(0, 10) + '...', paymentData });
    const response = await api.post('/payments/create-payment-intent', paymentData);
    console.log('API response for createPaymentIntent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in createPaymentIntent:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data?.message || 'Payment intent creation failed');
  }
};

export const confirmPayment = async (token, paymentData) => {
  try {
    setAuthToken(token);
    console.log('Sending confirmPayment request:', { token: token.substring(0, 10) + '...', paymentData });
    const response = await api.post('/payments/confirm-payment', paymentData);
    console.log('Confirm Payment Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in confirmPayment:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data?.message || 'Payment confirmation failed');
  }
};

export const getTransactions = async (token) => {
  try {
    setAuthToken(token);
    const response = await api.get('/payments/transactions');
    return response.data;
  } catch (error) {
    console.error('Get transactions error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
  }
};

// Send Subscription Email
export const sendSubscriptionEmail = async (token, userId) => {
  try {
    setAuthToken(token);
    console.log('Preparing to send subscription email:', { userId, token: token?.substring(0, 10) + '...' });
    const response = await api.post('/users/send-subscription-email', { userId });
    console.log('Subscription email response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending subscription email:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config,
    });
    throw new Error(error.response?.data?.message || 'Failed to send subscription email');
  }
};

export default api;