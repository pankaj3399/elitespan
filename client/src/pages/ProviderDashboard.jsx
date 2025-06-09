// client/src/pages/ProviderDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProvider } from '../services/api';
import {
  Edit,
  Save,
  X,
  User,
  Award,
  Camera,
  BarChart3,
  Star,
  ThumbsUp,
  Plus,
  Trash2,
  FileText,
} from 'lucide-react';

function ProviderDashboard() {
  const { user } = useAuth();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState({
    basic: false,
    qualifications: false,
    images: false,
    description: false, // NEW: Added description edit mode
  });
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.providerId) {
      fetchProviderData();
    }
  }, [user]);

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      const data = await getProvider(user.providerId);
      const providerData = data.provider || data;
      setProvider(providerData);
      setFormData(providerData);
    } catch (err) {
      console.error('Error fetching provider data:', err);
      setError('Failed to load your profile information.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = (section) => {
    setEditMode((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
    // Reset form data when canceling edit
    if (editMode[section]) {
      setFormData(provider);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ''],
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const saveSection = async (section) => {
    try {
      setSaving(true);
      let endpoint = '';
      let updateData = {};

      switch (section) {
        case 'basic':
          endpoint = `/api/provider-info/${user.providerId}`;
          updateData = {
            practiceName: formData.practiceName,
            providerName: formData.providerName,
            email: formData.email,
            npiNumber: formData.npiNumber,
            address: formData.address,
            suite: formData.suite,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
          };
          break;
        case 'qualifications':
          endpoint = `/api/provider-info/${user.providerId}/qualifications`;
          updateData = {
            specialties: formData.specialties || [],
            boardCertifications: formData.boardCertifications || [],
            hospitalAffiliations: formData.hospitalAffiliations || [],
            educationAndTraining: formData.educationAndTraining || [],
            stateLicenses: formData.stateLicenses || [],
          };
          break;
        case 'images':
          endpoint = `/api/provider-info/${user.providerId}/images`;
          updateData = {
            headshotUrl: formData.headshotUrl,
            galleryUrl: formData.galleryUrl,
          };
          break;
        case 'description': // NEW: Handle practice description
          endpoint = `/api/provider-info/${user.providerId}/images`;
          updateData = {
            practiceDescription: formData.practiceDescription,
          };
          break;
      }

      const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      const result = await response.json();
      setProvider(result.provider);
      setEditMode((prev) => ({ ...prev, [section]: false }));

      // Success animation
      const successDiv = document.createElement('div');
      successDiv.innerHTML = '✅ Changes saved successfully!';
      successDiv.className =
        'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce';
      document.body.appendChild(successDiv);
      setTimeout(() => document.body.removeChild(successDiv), 3000);
    } catch (err) {
      console.error('Error saving:', err);

      // Error animation
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = '❌ Failed to save changes';
      errorDiv.className =
        'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
      document.body.appendChild(errorDiv);
      setTimeout(() => document.body.removeChild(errorDiv), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Helper function to get image URL with fallback
  const getImageUrl = (imageUrl, type = 'headshot') => {
    if (!imageUrl) return null;

    // If it's already a full URL, return it
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    // Otherwise, construct the S3 URL (same logic as backend)
    const bucketName = import.meta.env.VITE_AWS_S3_BUCKET_NAME;
    const region = import.meta.env.VITE_AWS_REGION;

    if (bucketName && region) {
      return `https://${bucketName}.s3.${region}.amazonaws.com/${imageUrl}`;
    }

    // Fallback to the original value
    return imageUrl;
  };

  if (loading) {
    return (
      <div className='min-h-screen flex flex-col bg-gradient-to-br from-[#FCF8F4] via-[#F8F6F0] to-[#F0F4FC]'>
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <div className='relative'>
              <div className='animate-spin rounded-full h-16 w-16 border-4 border-[#0C1F6D]/20 border-t-[#0C1F6D] mx-auto mb-4'></div>
              <div className='absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-[#7F92E5] animate-pulse mx-auto'></div>
            </div>
            <p className='text-[#061140] font-medium font-karla text-lg'>
              Loading your profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen flex flex-col bg-gradient-to-br from-[#FCF8F4] via-[#F8F6F0] to-[#F0F4FC]'>
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg'>
            <div className='text-red-500 text-4xl mb-4 animate-bounce'>⚠️</div>
            <h2 className='text-2xl font-semibold text-[#061140] mb-2 font-montserrat'>
              Error Loading Profile
            </h2>
            <p className='text-gray-600 mb-6 font-karla'>{error}</p>
            <button
              onClick={fetchProviderData}
              className='px-6 py-3 bg-gradient-to-r from-[#0C1F6D] to-[#1a237e] text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium'
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#FCF8F4] via-[#F8F6F0] to-[#F0F4FC]'>
      <div className='max-w-6xl mx-auto px-4 py-8 mt-20'>
        {/* Header Section */}
        <div className='mb-8 text-center'>
          <div className='bg-gradient-to-r from-[#0C1F6D] to-[#7F92E5] bg-clip-text text-transparent'>
            <h1 className='text-4xl font-bold font-montserrat mb-3'>
              Provider Dashboard
            </h1>
          </div>
          <p className='text-[#484848] font-karla text-lg max-w-2xl mx-auto'>
            Manage your profile information, track your reviews, and update your
            practice details
          </p>

          {/* Quick Stats Bar */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-8'>
            <div className='bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
              <div className='flex items-center justify-center mb-2'>
                <Star className='text-[#0C1F6D] mr-2' size={24} />
                <span className='text-2xl font-bold text-[#0C1F6D]'>
                  {provider?.reviewStats?.totalReviews || 0}
                </span>
              </div>
              <p className='text-[#484848] font-karla'>Total Reviews</p>
            </div>
            <div className='bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
              <div className='flex items-center justify-center mb-2'>
                <ThumbsUp className='text-[#0C1F6D] mr-2' size={24} />
                <span className='text-2xl font-bold text-[#0C1F6D]'>
                  {provider?.reviewStats?.averageSatisfactionRating?.toFixed(
                    1
                  ) || '0.0'}
                </span>
              </div>
              <p className='text-[#484848] font-karla'>Avg Satisfaction</p>
            </div>
            <div className='bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
              <div className='flex items-center justify-center mb-2'>
                <BarChart3 className='text-[#0C1F6D] mr-2' size={24} />
                <span className='text-2xl font-bold text-[#0C1F6D]'>
                  {provider?.reviewStats?.averageEfficacyRating?.toFixed(1) ||
                    '0.0'}
                </span>
              </div>
              <p className='text-[#484848] font-karla'>Avg Efficacy</p>
            </div>
          </div>
        </div>

        {/* Basic Information Section */}
        <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20 hover:shadow-2xl transition-all duration-300'>
          <div className='flex justify-between items-center mb-6'>
            <div className='flex items-center'>
              <div className='bg-gradient-to-r from-[#0C1F6D] to-[#7F92E5] p-3 rounded-full mr-4'>
                <User className='text-white' size={24} />
              </div>
              <h2 className='text-2xl font-semibold text-[#061140] font-montserrat'>
                Basic Information
              </h2>
            </div>
            <button
              onClick={() => handleEditToggle('basic')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 transform hover:scale-105 ${
                editMode.basic
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg'
                  : 'bg-gradient-to-r from-[#0C1F6D] to-[#1a237e] text-white hover:shadow-lg'
              }`}
            >
              {editMode.basic ? <X size={18} /> : <Edit size={18} />}
              {editMode.basic ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editMode.basic ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Edit Form Fields */}
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-[#061140] mb-2 font-karla'>
                    Practice Name
                  </label>
                  <input
                    type='text'
                    value={formData.practiceName || ''}
                    onChange={(e) =>
                      handleInputChange('practiceName', e.target.value)
                    }
                    className='w-full px-4 py-3 border border-[#7E7E7E]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C1F6D] focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm'
                    placeholder='Enter practice name'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-[#061140] mb-2 font-karla'>
                    Provider Name
                  </label>
                  <input
                    type='text'
                    value={formData.providerName || ''}
                    onChange={(e) =>
                      handleInputChange('providerName', e.target.value)
                    }
                    className='w-full px-4 py-3 border border-[#7E7E7E]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C1F6D] focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm'
                    placeholder='Enter provider name'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-[#061140] mb-2 font-karla'>
                    Email
                  </label>
                  <input
                    type='email'
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className='w-full px-4 py-3 border border-[#7E7E7E]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C1F6D] focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm'
                    placeholder='Enter email address'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-[#061140] mb-2 font-karla'>
                    NPI Number
                  </label>
                  <input
                    type='text'
                    value={formData.npiNumber || ''}
                    onChange={(e) =>
                      handleInputChange('npiNumber', e.target.value)
                    }
                    className='w-full px-4 py-3 border border-[#7E7E7E]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C1F6D] focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm'
                    placeholder='Enter NPI number'
                  />
                </div>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-[#061140] mb-2 font-karla'>
                    Address
                  </label>
                  <input
                    type='text'
                    value={formData.address || ''}
                    onChange={(e) =>
                      handleInputChange('address', e.target.value)
                    }
                    className='w-full px-4 py-3 border border-[#7E7E7E]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C1F6D] focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm'
                    placeholder='Enter address'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-[#061140] mb-2 font-karla'>
                    Suite (Optional)
                  </label>
                  <input
                    type='text'
                    value={formData.suite || ''}
                    onChange={(e) => handleInputChange('suite', e.target.value)}
                    className='w-full px-4 py-3 border border-[#7E7E7E]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C1F6D] focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm'
                    placeholder='Suite, floor, etc.'
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-[#061140] mb-2 font-karla'>
                      City
                    </label>
                    <input
                      type='text'
                      value={formData.city || ''}
                      onChange={(e) =>
                        handleInputChange('city', e.target.value)
                      }
                      className='w-full px-4 py-3 border border-[#7E7E7E]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C1F6D] focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm'
                      placeholder='City'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-[#061140] mb-2 font-karla'>
                      State
                    </label>
                    <input
                      type='text'
                      value={formData.state || ''}
                      onChange={(e) =>
                        handleInputChange('state', e.target.value)
                      }
                      className='w-full px-4 py-3 border border-[#7E7E7E]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C1F6D] focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm'
                      placeholder='State'
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-[#061140] mb-2 font-karla'>
                    ZIP Code
                  </label>
                  <input
                    type='text'
                    value={formData.zip || ''}
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                    className='w-full px-4 py-3 border border-[#7E7E7E]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C1F6D] focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm'
                    placeholder='ZIP Code'
                  />
                </div>
              </div>

              <div className='md:col-span-2 flex justify-end mt-6'>
                <button
                  onClick={() => saveSection('basic')}
                  disabled={saving}
                  className='flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none font-medium'
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <div className='bg-gradient-to-r from-[#F8F6F0] to-[#FCF8F4] p-4 rounded-xl border border-[#7E7E7E]/20'>
                  <span className='font-medium text-[#061140] font-karla block mb-1'>
                    Practice Name
                  </span>
                  <p className='text-[#484848] font-karla'>
                    {provider?.practiceName || 'Not provided'}
                  </p>
                </div>
                <div className='bg-gradient-to-r from-[#F8F6F0] to-[#FCF8F4] p-4 rounded-xl border border-[#7E7E7E]/20'>
                  <span className='font-medium text-[#061140] font-karla block mb-1'>
                    Provider Name
                  </span>
                  <p className='text-[#484848] font-karla'>
                    {provider?.providerName || 'Not provided'}
                  </p>
                </div>
                <div className='bg-gradient-to-r from-[#F8F6F0] to-[#FCF8F4] p-4 rounded-xl border border-[#7E7E7E]/20'>
                  <span className='font-medium text-[#061140] font-karla block mb-1'>
                    Email
                  </span>
                  <p className='text-[#484848] font-karla'>
                    {provider?.email || 'Not provided'}
                  </p>
                </div>
              </div>
              <div className='space-y-4'>
                <div className='bg-gradient-to-r from-[#F8F6F0] to-[#FCF8F4] p-4 rounded-xl border border-[#7E7E7E]/20'>
                  <span className='font-medium text-[#061140] font-karla block mb-1'>
                    NPI Number
                  </span>
                  <p className='text-[#484848] font-karla'>
                    {provider?.npiNumber || 'Not provided'}
                  </p>
                </div>
                <div className='bg-gradient-to-r from-[#F8F6F0] to-[#FCF8F4] p-4 rounded-xl border border-[#7E7E7E]/20'>
                  <span className='font-medium text-[#061140] font-karla block mb-1'>
                    Address
                  </span>
                  <p className='text-[#484848] font-karla'>
                    {provider?.fullAddress || 'Address not provided'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* NEW: Practice Description Section */}
        <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20 hover:shadow-2xl transition-all duration-300'>
          <div className='flex justify-between items-center mb-6'>
            <div className='flex items-center'>
              <div className='bg-gradient-to-r from-[#0C1F6D] to-[#7F92E5] p-3 rounded-full mr-4'>
                <FileText className='text-white' size={24} />
              </div>
              <h2 className='text-2xl font-semibold text-[#061140] font-montserrat'>
                Practice Description
              </h2>
            </div>
            <button
              onClick={() => handleEditToggle('description')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 transform hover:scale-105 ${
                editMode.description
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg'
                  : 'bg-gradient-to-r from-[#0C1F6D] to-[#1a237e] text-white hover:shadow-lg'
              }`}
            >
              {editMode.description ? <X size={18} /> : <Edit size={18} />}
              {editMode.description ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editMode.description ? (
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-[#061140] mb-2 font-karla'>
                  Tell patients about your practice, approach, and what makes
                  you unique
                </label>
                <textarea
                  value={formData.practiceDescription || ''}
                  onChange={(e) =>
                    handleInputChange('practiceDescription', e.target.value)
                  }
                  rows={8}
                  maxLength={1000}
                  className='w-full px-4 py-3 border border-[#7E7E7E]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C1F6D] focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none'
                  placeholder='Describe your practice, treatment philosophy, areas of expertise, and what patients can expect when they visit...'
                />
                <div className='flex justify-between items-center text-xs text-[#484848] mt-1'>
                  <span></span>
                  <span>
                    {(formData.practiceDescription || '').length}/1000
                    characters
                  </span>
                </div>
              </div>

              <div className='flex justify-end mt-6'>
                <button
                  onClick={() => saveSection('description')}
                  disabled={saving}
                  className='flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none font-medium'
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className='bg-gradient-to-r from-[#F8F6F0] to-[#FCF8F4] p-6 rounded-xl border border-[#7E7E7E]/20'>
              <div className='text-[#484848] font-karla leading-relaxed'>
                {provider?.practiceDescription &&
                provider.practiceDescription.trim() ? (
                  <p className='whitespace-pre-wrap'>
                    {provider.practiceDescription}
                  </p>
                ) : (
                  <p className='text-[#7E7E7E] italic'>
                    No practice description provided yet. Click "Edit" to add
                    information about your practice, treatment philosophy, and
                    what makes you unique.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Qualifications Section */}
        <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20 hover:shadow-2xl transition-all duration-300'>
          <div className='flex justify-between items-center mb-6'>
            <div className='flex items-center'>
              <div className='bg-gradient-to-r from-[#0C1F6D] to-[#7F92E5] p-3 rounded-full mr-4'>
                <Award className='text-white' size={24} />
              </div>
              <h2 className='text-2xl font-semibold text-[#061140] font-montserrat'>
                Qualifications
              </h2>
            </div>
            <button
              onClick={() => handleEditToggle('qualifications')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 transform hover:scale-105 ${
                editMode.qualifications
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg'
                  : 'bg-gradient-to-r from-[#0C1F6D] to-[#1a237e] text-white hover:shadow-lg'
              }`}
            >
              {editMode.qualifications ? <X size={18} /> : <Edit size={18} />}
              {editMode.qualifications ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editMode.qualifications ? (
            <div className='space-y-8'>
              {/* Specialties */}
              <div>
                <label className='block text-lg font-medium text-[#061140] mb-4 font-montserrat'>
                  Specialties
                </label>
                <div className='space-y-3'>
                  {(formData.specialties || []).map((specialty, index) => (
                    <div key={index} className='flex gap-3 items-center'>
                      <input
                        type='text'
                        value={specialty}
                        onChange={(e) =>
                          handleArrayChange(
                            'specialties',
                            index,
                            e.target.value
                          )
                        }
                        className='flex-1 px-4 py-3 border border-[#7E7E7E]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C1F6D] focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm'
                        placeholder='Enter specialty'
                      />
                      <button
                        onClick={() => removeArrayItem('specialties', index)}
                        className='p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200'
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => addArrayItem('specialties')}
                  className='mt-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium'
                >
                  <Plus size={18} />
                  Add Specialty
                </button>
              </div>

              {/* Board Certifications */}
              <div>
                <label className='block text-lg font-medium text-[#061140] mb-4 font-montserrat'>
                  Board Certifications
                </label>
                <div className='space-y-3'>
                  {(formData.boardCertifications || []).map((cert, index) => (
                    <div key={index} className='flex gap-3 items-center'>
                      <input
                        type='text'
                        value={cert}
                        onChange={(e) =>
                          handleArrayChange(
                            'boardCertifications',
                            index,
                            e.target.value
                          )
                        }
                        className='flex-1 px-4 py-3 border border-[#7E7E7E]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C1F6D] focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm'
                        placeholder='Enter certification'
                      />
                      <button
                        onClick={() =>
                          removeArrayItem('boardCertifications', index)
                        }
                        className='p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200'
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => addArrayItem('boardCertifications')}
                  className='mt-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium'
                >
                  <Plus size={18} />
                  Add Certification
                </button>
              </div>

              <div className='flex justify-end mt-8'>
                <button
                  onClick={() => saveSection('qualifications')}
                  disabled={saving}
                  className='flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none font-medium'
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='bg-gradient-to-r from-[#F8F6F0] to-[#FCF8F4] p-6 rounded-xl border border-[#7E7E7E]/20'>
                <span className='font-medium text-[#061140] font-karla block mb-3'>
                  Specialties
                </span>
                <div className='flex flex-wrap gap-2'>
                  {provider?.specialties?.length > 0 ? (
                    provider.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className='px-3 py-1 bg-[#0C1F6D]/10 text-[#061140] rounded-full text-sm font-karla border border-[#0C1F6D]/20'
                      >
                        {specialty}
                      </span>
                    ))
                  ) : (
                    <span className='text-[#484848] font-karla'>
                      Not provided
                    </span>
                  )}
                </div>
              </div>
              <div className='bg-gradient-to-r from-[#F8F6F0] to-[#FCF8F4] p-6 rounded-xl border border-[#7E7E7E]/20'>
                <span className='font-medium text-[#061140] font-karla block mb-3'>
                  Board Certifications
                </span>
                <div className='flex flex-wrap gap-2'>
                  {provider?.boardCertifications?.length > 0 ? (
                    provider.boardCertifications.map((cert, index) => (
                      <span
                        key={index}
                        className='px-3 py-1 bg-[#0C1F6D]/10 text-[#061140] rounded-full text-sm font-karla border border-[#0C1F6D]/20'
                      >
                        {cert}
                      </span>
                    ))
                  ) : (
                    <span className='text-[#484848] font-karla'>
                      Not provided
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Images Section */}
        <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20 hover:shadow-2xl transition-all duration-300'>
          <div className='flex justify-between items-center mb-6'>
            <div className='flex items-center'>
              <div className='bg-gradient-to-r from-[#0C1F6D] to-[#7F92E5] p-3 rounded-full mr-4'>
                <Camera className='text-white' size={24} />
              </div>
              <h2 className='text-2xl font-semibold text-[#061140] font-montserrat'>
                Profile Images
              </h2>
            </div>
            <button
              onClick={() => handleEditToggle('images')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 transform hover:scale-105 ${
                editMode.images
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg'
                  : 'bg-gradient-to-r from-[#0C1F6D] to-[#1a237e] text-white hover:shadow-lg'
              }`}
            >
              {editMode.images ? <X size={18} /> : <Edit size={18} />}
              {editMode.images ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div>
              <h3 className='font-medium text-[#061140] mb-4 font-montserrat text-lg'>
                Headshot
              </h3>
              <div className='relative group'>
                {getImageUrl(provider?.headshotUrl) ? (
                  <img
                    src={getImageUrl(provider.headshotUrl)}
                    alt='Provider headshot'
                    className='w-full h-64 object-cover rounded-2xl border-4 border-white shadow-lg group-hover:shadow-xl transition-all duration-300'
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className='w-full h-64 bg-gradient-to-br from-[#F8F6F0] to-[#FCF8F4] rounded-2xl border-4 border-white shadow-lg flex items-center justify-center'
                  style={{
                    display: getImageUrl(provider?.headshotUrl)
                      ? 'none'
                      : 'flex',
                  }}
                >
                  <div className='text-center'>
                    <Camera className='text-[#7E7E7E] mx-auto mb-2' size={32} />
                    <span className='text-[#7E7E7E] font-karla'>
                      No headshot uploaded
                    </span>
                  </div>
                </div>
              </div>
              {editMode.images && (
                <div className='mt-4'>
                  <input
                    type='text'
                    value={formData.headshotUrl || ''}
                    onChange={(e) =>
                      handleInputChange('headshotUrl', e.target.value)
                    }
                    placeholder='Headshot URL'
                    className='w-full px-4 py-3 border border-[#7E7E7E]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C1F6D] focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm'
                  />
                </div>
              )}
            </div>

            <div>
              <h3 className='font-medium text-[#061140] mb-4 font-montserrat text-lg'>
                Gallery Image
              </h3>
              <div className='relative group'>
                {getImageUrl(provider?.galleryUrl) ? (
                  <img
                    src={getImageUrl(provider.galleryUrl)}
                    alt='Provider gallery'
                    className='w-full h-64 object-cover rounded-2xl border-4 border-white shadow-lg group-hover:shadow-xl transition-all duration-300'
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className='w-full h-64 bg-gradient-to-br from-[#F8F6F0] to-[#FCF8F4] rounded-2xl border-4 border-white shadow-lg flex items-center justify-center'
                  style={{
                    display: getImageUrl(provider?.galleryUrl)
                      ? 'none'
                      : 'flex',
                  }}
                >
                  <div className='text-center'>
                    <Camera className='text-[#7E7E7E] mx-auto mb-2' size={32} />
                    <span className='text-[#7E7E7E] font-karla'>
                      No gallery image uploaded
                    </span>
                  </div>
                </div>
              </div>
              {editMode.images && (
                <div className='mt-4'>
                  <input
                    type='text'
                    value={formData.galleryUrl || ''}
                    onChange={(e) =>
                      handleInputChange('galleryUrl', e.target.value)
                    }
                    placeholder='Gallery URL'
                    className='w-full px-4 py-3 border border-[#7E7E7E]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C1F6D] focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm'
                  />
                </div>
              )}
            </div>
          </div>

          {editMode.images && (
            <div className='flex justify-end mt-8'>
              <button
                onClick={() => saveSection('images')}
                disabled={saving}
                className='flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none font-medium'
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProviderDashboard;
