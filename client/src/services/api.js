// client/src/services/api.js

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api';

export const signup = async (userData) => {
  try {
    const response = await fetch(`${BASE_URL}/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Signup failed');
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

// Doctor Endpoints (Milestone 2)
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
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch doctor profile');
    return response.json();
  } catch (error) {
    throw new Error(error.message || 'Server error while fetching doctor profile');
  }
};

// Admin Endpoints (Milestone 2)
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
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch all doctors');
    return response.json();
  } catch (error) {
    throw new Error(error.message || 'Server error while fetching all doctors');
  }
};