import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
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
    const response = await api.post("/users/signup", userData);
    return response.data;
  } catch (error) {
    console.error("Signup error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Signup failed");
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post("/users/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const updateProfile = async (token, profileData) => {
  try {
    setAuthToken(token);
    const response = await api.put("/users/profile", profileData);
    return response.data;
  } catch (error) {
    console.error(
      "Update profile error:",
      error.response?.data || error.message,
    );
    throw new Error(error.response?.data?.message || "Profile update failed");
  }
};

export const editProfile = async (token, profileData) => {
  try {
    setAuthToken(token);
    const response = await api.put("/users/profile", profileData);
    return response.data;
  } catch (error) {
    console.error("Edit profile error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Profile update failed");
  }
};

export const getDoctors = async (filters) => {
  try {
    const query = new URLSearchParams(filters).toString();
    const response = await api.get(`/doctors?${query}`);
    return response.data;
  } catch (error) {
    console.error("Get doctors error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch doctors");
  }
};

// Doctor Endpoints
export const doctorSignup = async (doctorData) => {
  try {
    const response = await api.post("/doctors/signup", doctorData);
    return response.data;
  } catch (error) {
    console.error(
      "Doctor signup error:",
      error.response?.data || error.message,
    );
    throw new Error(error.response?.data?.message || "Doctor signup failed");
  }
};

export const doctorLogin = async (credentials) => {
  try {
    const response = await api.post("/doctors/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Doctor login error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Doctor login failed");
  }
};

export const updateDoctorProfile = async (token, profileData) => {
  try {
    setAuthToken(token);
    const response = await api.put("/doctors/profile", profileData);
    return response.data;
  } catch (error) {
    console.error(
      "Update doctor profile error:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Doctor profile update failed",
    );
  }
};

export const getDoctorProfile = async (token) => {
  try {
    setAuthToken(token);
    const response = await api.get("/doctors/profile");
    return response.data;
  } catch (error) {
    console.error(
      "Get doctor profile error:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch doctor profile",
    );
  }
};

// Admin Endpoints
export const adminSignup = async (adminData) => {
  try {
    const response = await api.post("/admins/signup", adminData);
    return response.data;
  } catch (error) {
    console.error("Admin signup error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Admin signup failed");
  }
};

export const adminLogin = async (credentials) => {
  try {
    const response = await api.post("/admins/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Admin login error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Admin login failed");
  }
};

export const updateDoctorApproval = async (token, approvalData) => {
  try {
    setAuthToken(token);
    const response = await api.put("/admins/doctors/approve", approvalData);
    return response.data;
  } catch (error) {
    console.error(
      "Update doctor approval error:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Doctor approval update failed",
    );
  }
};

export const getAllDoctors = async (token) => {
  try {
    setAuthToken(token);
    const response = await api.get("/admins/doctors");
    return response.data;
  } catch (error) {
    console.error(
      "Get all doctors error:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch all doctors",
    );
  }
};

// Admin Provider Management Endpoints
export const getAllProvidersAdmin = async (token, filters = {}) => {
  try {
    setAuthToken(token);
    const query = new URLSearchParams(filters).toString();
    const response = await api.get(`/admins/providers?${query}`);
    return response.data;
  } catch (error) {
    console.error(
      "Get all providers error:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch providers",
    );
  }
};

export const updateProviderApproval = async (token, providerId, isApproved) => {
  try {
    setAuthToken(token);
    const status = isApproved ? "approve" : "block";
    const response = await api.put(`/admins/providers/${providerId}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Update provider approval error:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Failed to update provider approval",
    );
  }
};

// Payment Endpoints
export const createPaymentIntent = async (token, paymentData) => {
  try {
    setAuthToken(token);
    console.log("Sending createPaymentIntent request:", {
      token: token.substring(0, 10) + "...",
      paymentData,
    });
    const response = await api.post(
      "/payments/create-payment-intent",
      paymentData,
    );
    console.log("API response for createPaymentIntent:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in createPaymentIntent:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(
      error.response?.data?.message || "Payment intent creation failed",
    );
  }
};

export const confirmPayment = async (token, paymentData) => {
  try {
    setAuthToken(token);
    console.log("Sending confirmPayment request:", {
      token: token.substring(0, 10) + "...",
      paymentData,
    });
    const response = await api.post("/payments/confirm-payment", paymentData);
    console.log("Confirm Payment Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in confirmPayment:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(
      error.response?.data?.message || "Payment confirmation failed",
    );
  }
};

export const getTransactions = async (token) => {
  try {
    setAuthToken(token);
    const response = await api.get("/payments/transactions");
    return response.data;
  } catch (error) {
    console.error(
      "Get transactions error:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch transactions",
    );
  }
};

export const saveProviderInfo = async (providerData) => {
  try {
    const response = await api.post("/provider-info", providerData);
    return response.data;
  } catch (error) {
    console.error(
      "Save provider info error:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Failed to save provider info",
    );
  }
};

export const saveQualifications = async (providerId, qualificationsData) => {
  try {
    const response = await api.put(
      `/provider-info/${providerId}/qualifications`,
      qualificationsData,
    );
    return response.data;
  } catch (error) {
    console.error(
      "Save qualifications error:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Failed to save qualifications",
    );
  }
};

export const getUploadSignature = async (fileName, fileType) => {
  try {
    const response = await api.post("/signature", { fileName, fileType });
    return response.data;
  } catch (error) {
    console.error(
      "Error getting upload signature:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Failed to get upload signature",
    );
  }
};

export const uploadToS3 = async (file, presignedUrl) => {
  try {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to upload file to S3");
    }

    return true;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file");
  }
};

export const uploadReviewsExcel = async (providerId, file) => {
  const formData = new FormData();
  formData.append("reviewsFile", file);

  const response = await fetch(
    `${BASE_URL}/api/provider-info/${providerId}/upload-reviews`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to upload reviews");
  }

  return response.json();
};

// Get provider reviews
export const getProviderReviews = async (providerId, page = 1, limit = 10) => {
  const response = await api.get(
    `/provider-info/${providerId}/reviews?page=${page}&limit=${limit}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch reviews");
  }

  return response.data;
};

export const saveImageUrls = async (providerId, imageData) => {
  try {
    const response = await api.put(
      `/provider-info/${providerId}/images`,
      imageData,
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error saving image URLs:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Failed to save uploaded files",
    );
  }
};

// ❌ REMOVED: sendSubscriptionEmail - emails now sent automatically by payment backend

// New Promo Code Endpoints
export const createPromoCode = async (token, promoCodeData) => {
  try {
    setAuthToken(token);
    const response = await api.post("/promo-codes/create", promoCodeData);
    return response.data;
  } catch (error) {
    console.error(
      "Create promo code error:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Failed to create promo code",
    );
  }
};

export const getPromoCodes = async (token) => {
  try {
    setAuthToken(token);
    const response = await api.get("/promo-codes/list");
    return response.data;
  } catch (error) {
    console.error(
      "Get promo codes error:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch promo codes",
    );
  }
};

export const validatePromoCode = async (token, code) => {
  try {
    setAuthToken(token);
    console.log("Sending validatePromoCode request with code:", code);
    const response = await api.post("/promo-codes/validate", { code: code });
    console.log("Validate promo code response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Validate promo code error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(
      error.response?.data?.message || "Invalid or expired promo code",
    );
  }
};

export const getProvider = async (providerId) => {
  try {
    const response = await api.get(`/provider-info/${providerId}`);
    return response.data;
  } catch (error) {
    console.error("Get provider error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to fetch provider",
    );
  }
};

export const getAllProviders = async (filters = {}) => {
  try {
    const query = new URLSearchParams(filters).toString();
    const response = await api.get(`/provider-info?${query}`);
    return response.data;
  } catch (error) {
    console.error(
      "Get providers error:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch providers",
    );
  }
};

export default api;