/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// client/src/components/ContactInfoForm.jsx
import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { signup } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from '@googlemaps/js-api-loader';

const ContactInfoForm = ({ onClose, onContinue, userId }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [contactProviders, setContactProviders] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingMaps, setIsLoadingMaps] = useState(true);
  const { loginUser } = useAuth();

  // Google Maps autocomplete
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({ specialties: [] });
  const specialtiesOptions = [
    'Autoimmune',
    'Dentistry',
    'Functional Medicine',
    'Longevity Medicine',
    "Men's Health",
    'Neurodegenerative Disease',
    'Nutrition',
    'Orthopedic',
    'Regenerative Aesthetics',
    'Vision',
    "Women's Health",
  ];

  // Initialize Google Maps autocomplete
  useEffect(() => {
    const initializeAutocomplete = async () => {
      try {
        const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        
        if (!GOOGLE_MAPS_API_KEY) {
          console.warn('Google Maps API key not found. Address autocomplete will not work.');
          setIsLoadingMaps(false);
          return;
        }

        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places'],
        });

        await loader.load();

        if (addressInputRef.current) {
          autocompleteRef.current = new google.maps.places.Autocomplete(
            addressInputRef.current,
            {
              types: ['address'],
              componentRestrictions: { country: 'us' }, // Restrict to US addresses
              fields: ['formatted_address', 'geometry'],
            }
          );

          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current.getPlace();
            if (place.formatted_address) {
              setAddress(place.formatted_address);
            }
          });
        }

        setIsLoadingMaps(false);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setIsLoadingMaps(false);
      }
    };

    initializeAutocomplete();

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  // Format phone number to remove dashes and non-numeric characters
  const formatPhoneNumber = (value) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    // Format as XXX-XXX-XXXX for display, but store clean version
    if (cleaned.length >= 6) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(
        6,
        10
      )}`;
    } else if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }
    return cleaned;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const toggleSpecialty = (specialty) => {
    setFormData((prev) => {
      const alreadySelected = prev.specialties.includes(specialty);
      return {
        ...prev,
        specialties: alreadySelected
          ? prev.specialties.filter((s) => s !== specialty)
          : [...prev.specialties, specialty],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (!terms || !contactProviders) {
      setError('You must agree to the Terms & Services');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError('First Name and Last Name are required');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('A valid email address is required');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (!phoneNumber.trim() || !/^\d{3}-\d{3}-\d{4}$/.test(phoneNumber)) {
      setError('Phone number must be in the format 000-000-0000');
      return;
    }
    if (!address.trim()) {
      setError('Address is required for location-based provider matching');
      return;
    }
    if (formData.specialties.length === 0) {
      setError('Please select at least one area of interest');
      return;
    }

    const payload = {
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim(),
      password: password.trim(),
      contactInfo: {
        phone: phoneNumber.trim() || '',
        address: address.trim(),
        specialties: formData.specialties,
      },
    };
    console.log('Signup payload:', JSON.stringify(payload, null, 2));

    try {
      // Directly attempt to sign up the user.
      const response = await signup(payload);
      console.log('Signup response:', response);

      if (!response.user || !response.user.id) {
        throw new Error('Signup response does not contain user ID');
      }

      // On successful signup, log the user in and continue.
      loginUser(response.token, response.user);
      onContinue(response.user.id);
    } catch (err) {
      // Handle errors from the signup API, including duplicate email errors.
      if (err.message && err.message.includes('Unable to verify the provided address')) {
        setError('Unable to verify your address. Please check that your address is correct and try again.');
      } else if (err.message && err.message.includes('{')) {
        try {
          const errorData = JSON.parse(err.message);
          setError(errorData.message || 'Signup failed');
        } catch (parseError) {
          setError('Signup failed due to an unknown error');
        }
      } else {
        setError(err.message || 'Server error during signup');
      }
      console.error('Error in signup:', err);
    }
  };

  const formContainerStyle = {
    maxHeight: '400px',
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(11, 7, 87, 0.1) transparent',
  };

  const scrollbarStyles = `
    .form-container::-webkit-scrollbar {
      width: 5px;
    }
    .form-container::-webkit-scrollbar-track {
      background: transparent;
    }
    .form-container::-webkit-scrollbar-thumb {
      background-color: rgba(11, 7, 87, 0.1);
      border-radius: 20px;
    }
    .form-container::-webkit-scrollbar-thumb:hover {
      background-color: rgba(11, 7, 87, 0.2);
    }
  `;

  return (
    <div
      style={{ fontFamily: 'Karla' }}
      className='fixed inset-0 backdrop-blur-md bg-opacity-0 flex items-center justify-center z-50'
    >
      <style>{scrollbarStyles}</style>
      <div className='bg-white p-8 rounded-3xl shadow-lg relative max-w-md w-full mx-4 max-h-screen overflow-y-auto'>
        <button
          onClick={onClose}
          className='absolute top-5 right-5 p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors z-10 cursor-pointer'
        >
          <X className='w-6 h-6' />
        </button>

        <h2
          style={{ fontFamily: 'Montserrat' }}
          className='text-2xl font-semibold text-[#0B0757] mb-4'
        >
          Contact Information
        </h2>

        <p className='text-center text-gray-600 mb-8'>
          Please provide your contact details to join Elite Healthspan. This
          information will help us personalize your experience and connect you
          with our network of providers.
        </p>

        <div className='form-container' style={formContainerStyle}>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div className='flex gap-4'>
              <div className='flex-1 flex flex-col gap-2'>
                <label className='text-gray-700 text-sm'>First Name</label>
                <input
                  type='text'
                  placeholder='First Name'
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]'
                  required
                />
              </div>
              <div className='flex-1 flex flex-col gap-2'>
                <label className='text-gray-700 text-sm'>Last Name</label>
                <input
                  type='text'
                  placeholder='Last Name'
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]'
                  required
                />
              </div>
            </div>

            <div className='flex flex-col gap-2'>
              <label className='text-gray-700 text-sm'>Email</label>
              <input
                type='email'
                placeholder='Email Address'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]'
                required
              />
            </div>

            <div className='flex flex-col gap-2'>
              <label className='text-gray-700 text-sm'>Password</label>
              <input
                type='password'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]'
                required
              />
            </div>

            <div className='flex flex-col gap-2'>
              <label className='text-gray-700 text-sm'>Phone Number</label>
              <input
                type='tel'
                placeholder='000-000-0000'
                value={phoneNumber}
                onChange={handlePhoneChange}
                className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]'
                maxLength='12'
                required
              />
            </div>

            <div className='flex flex-col gap-2'>
              <label className='text-gray-700 text-sm'>
                Address {isLoadingMaps && <span className='text-xs text-gray-500'>(Loading suggestions...)</span>}
              </label>
              <input
                ref={addressInputRef}
                type='text'
                placeholder='Start typing your address...'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]'
                required
              />
              <p className='text-xs text-gray-500'>
                Required for finding providers near you
              </p>
            </div>

            {/* Specialties Dropdown */}
            <div className='flex flex-col gap-2'>
              <label
                htmlFor='specialties'
                className='block text-sm font-normal text-gray-700'
              >
                Areas of Interest (Select all that apply)
              </label>
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className='mt-1 flex items-center justify-between w-full px-4 py-3 border border-gray-200 rounded-md cursor-pointer focus:outline-none'
              >
                <div
                  className='flex flex-wrap gap-2'
                  onClick={(e) => e.stopPropagation()}
                >
                  {formData.specialties.length > 0 ? (
                    formData.specialties.map((spec) => (
                      <div
                        key={spec}
                        className='flex items-center bg-[#DFE3F2] text-[#061140] px-2 rounded-xs text-xs'
                      >
                        <span className='mr-1'>{spec}</span>
                        <button
                          type='button'
                          onClick={() => toggleSpecialty(spec)}
                          className='text-black text-[18px] focus:outline-none pb-[2px] cursor-pointer'
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className='text-[#7E7E7E]'>Specialties</span>
                  )}
                </div>
                {dropdownOpen ? (
                  <FaChevronUp className='ml-2 h-[18px] w-[18px] text-gray-400' />
                ) : (
                  <FaChevronDown className='ml-2 h-[18px] w-[18px] text-gray-400' />
                )}
              </div>

              {dropdownOpen && (
                <div className='z-10 mt-2 w-full border border-gray-200 rounded-md shadow-md max-h-48 overflow-y-auto'>
                  {specialtiesOptions.map((option) => (
                    <label
                      key={option}
                      className='flex items-center px-4 py-2 text-sm text-[#484848] hover:bg-[#DFE3F2] cursor-pointer'
                    >
                      <input
                        type='checkbox'
                        checked={formData.specialties.includes(option)}
                        onChange={() => toggleSpecialty(option)}
                        className='mr-2 accent-[#0C1F6D] text-[#0C1F6D] rounded border-[#7E7E7E] focus:ring-[#0C1F6D] cursor-pointer'
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                checked={contactProviders}
                onChange={(e) => setContactProviders(e.target.checked)}
                className='w-4 h-4 text-[#0B0757] border-gray-200 rounded focus:ring-[#0B0757] cursor-pointer'
                required
              />
              <label className='text-gray-700 text-sm cursor-pointer'>
                Use this information when contacting providers & clinics.
              </label>
            </div>

            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className='w-4 h-4 text-[#0B0757] border-gray-200 rounded focus:ring-[#0B0757] cursor-pointer'
                required
              />
              <label className='text-gray-700 text-sm cursor-pointer'>
                By joining, you agree to our Terms & Services.
              </label>
            </div>
          </form>
        </div>

        {error && <p className='text-red-500 text-sm mt-4'>{error}</p>}

        <div className='flex justify-between gap-4 mt-4'>
          <button
            onClick={onClose}
            className='w-full py-3 bg-white text-[#0B0757] rounded-full border border-[#0B0757] font-medium text-base hover:bg-gray-100 cursor-pointer'
          >
            Back
          </button>
          <button
            type='submit'
            onClick={handleSubmit}
            className='w-full py-3 bg-[#0C1F6D] text-white rounded-full font-medium text-base hover:bg-[#1a237e] cursor-pointer'
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoForm;