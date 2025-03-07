// client/src/services/api.js

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api';

export const signup = async (userData) => {
  try {
    const response = await fetch(`${BASE_URL}/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Signup failed');
    }
    return response.json();
  } catch (error) {
    throw new Error(error.message || 'Server error during signup');
  }
};

export const login = async (credentials) => {
  try {
    const response = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  } catch (error) {
    throw new Error(error.message || 'Server error during login');
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Profile update failed');
    }
    return response.json();
  } catch (error) {
    throw new Error(error.message || 'Server error during profile update');
  }
};

export const editProfile = async (token, profileData) => {
  try {
    const response = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    if (!response.ok) throw new Error('Profile update failed');
    return response.json();
  } catch (error) {
    throw new Error(error.message || 'Server error during profile update');
  }
};

export const getDoctors = async (filters) => {
  try {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${BASE_URL}/doctors?${query}`);
    if (!response.ok) throw new Error('Failed to fetch doctors');
    return response.json();
  } catch (error) {
    throw new Error(error.message || 'Server error while fetching doctors');
  }
};

// Doctor Endpoints
export const doctorSignup = async (doctorData) => {
  try {
    const response = await fetch(`${BASE_URL}/doctors/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doctorData),
    });
    if (!response.ok) throw new Error('Doctor signup failed');
    return response.json();
  } catch (error) {
    throw new Error(error.message || 'Server error during doctor signup');
  }
};

export const doctorLogin = async (credentials) => {
  try {
    const response = await fetch(`${BASE_URL}/doctors/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Doctor login failed');
    return response.json();
  } catch (error) {
    throw new Error(error.message || 'Server error during doctor login');
  }
};

export const updateDoctorProfile = async (token, profileData) => {
  try {
    const response = await fetch(`${BASE_URL}/doctors/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    if (!response.ok) throw new Error('Doctor profile update failed');
    return response.json();
  } catch (error) {
    throw new Error(error.message || 'Server error during doctor profile update');
  }
};

export const getDoctorProfile = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/doctors/profile`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch doctor profile');
    return response.json();
  } catch (error) {
    throw new Error(error.message || 'Server error while fetching doctor profile');
  }
};

// Admin Endpoints
export const adminSignup = async (adminData) => {
  try {
    const response = await fetch(`${BASE_URL}/admins/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData),
    });
    if (!response.ok) throw new Error('Admin signup failed');
    return response.json();
  } catch (error) {
    throw new Error(error.message || 'Server error during admin signup');
  }
};

export const adminLogin = async (credentials) => {
  try {
    const response = await fetch(`${BASE_URL}/admins/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Admin login failed');
    return response.json();
  } catch (error) {
    throw new Error(error.message || 'Server error during admin login');
  }
};

export const updateDoctorApproval = async (token, approvalData) => {
  try {
    const response = await fetch(`${BASE_URL}/admins/doctors/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(approvalData),
    });
    if (!response.ok) throw new Error('Doctor approval update failed');
    return response.json();
  } catch (error) {
    throw new Error(error.message || 'Server error during doctor approval update');
  }
};

export const getAllDoctors = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/admins/doctors`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch all doctors');
    return response.json();
  } catch (error) {
    throw new Error(error.message || 'Server error while fetching all doctors');
  }
};

// Payment Endpoints
export const createPaymentIntent = async (token, paymentData) => {
  try {
    const response = await fetch(`${BASE_URL}/payments/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    });
    if (!response.ok) throw new Error('Payment intent creation failed');
    const data = await response.json();
    console.log('API response for createPaymentIntent:', data); // Debug the response
    return data;
  } catch (error) {
    console.error('Error in createPaymentIntent:', error);
    throw new Error(error.message || 'Server error during payment intent creation');
  }
};

export const confirmPayment = async (token, paymentData) => {
  try {
    const response = await fetch(`${BASE_URL}/payments/confirm-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        paymentIntentId: paymentData.paymentIntentId,
        paymentMethodId: paymentData.paymentMethodId,
      }),
    });
    const responseData = await response.json(); // Capture response data
    console.log('Confirm Payment Response:', {
      status: response.status,
      statusText: response.statusText,
      data: responseData,
    });
    if (!response.ok) throw new Error(`Payment confirmation failed with status ${response.status}: ${responseData.message || 'Unknown error'}`);
    return responseData;
  } catch (error) {
    console.error('Error in confirmPayment:', error);
    throw new Error(error.message || 'Server error during payment confirmation');
  }
};

export const getTransactions = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/payments/transactions`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  } catch (error) {
    throw new Error(error.message || 'Server error while fetching transactions');
  }
};