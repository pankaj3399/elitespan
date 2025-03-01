const BASE_URL = 'https://elitespan-kxpd.vercel.app/api';

export const signup = async (userData) => {
  const response = await fetch(`${BASE_URL}/users/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return response.json();
};

export const login = async (credentials) => {
  const response = await fetch(`${BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return response.json();
};

export const editProfile = async (token, profileData) => {
  const response = await fetch(`${BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
  return response.json();
};

export const getDoctors = async (filters) => {
  const query = new URLSearchParams(filters).toString();
  const response = await fetch(`${BASE_URL}/doctors?${query}`);
  return response.json();
};