// client/src/pages/ProviderPortal.jsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { saveProviderInfo } from '../services/api';

function ProviderPortal() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    practiceName: '',
    providerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    npiNumber: '',
    address: '',
    suite: '',
    city: '',
    state: '',
    zip: '',
  });

  const [errors, setErrors] = useState({
    practiceName: '',
    providerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    npiNumber: '',
    address: '',
    suite: '',
    city: '',
    state: '',
    zip: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear server-side errors when user starts typing
    if (errors[name] && (errors[name].includes('already exists') || errors[name].includes('already registered'))) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    // Real-time validation
    if (name !== 'suite') {
      // Suite is optional
      setErrors((prev) => ({
        ...prev,
        [name]: value.trim() === '' ? 'This field is required.' : '',
      }));
    }

    // Specific validations
    if (name === 'npiNumber') {
      const isValid = /^\d{10}$/.test(value);
      setErrors((prev) => ({
        ...prev,
        npiNumber:
          isValid || value === ''
            ? ''
            : 'Invalid NPI Number. It must be 10 digits.',
      }));
    }

    if (name === 'email') {
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      setErrors((prev) => ({
        ...prev,
        email: isValidEmail || value === '' ? '' : 'Invalid email address.',
      }));
    }

    if (name === 'password') {
      const isValidPassword = value.length >= 6;
      setErrors((prev) => ({
        ...prev,
        password:
          isValidPassword || value === ''
            ? ''
            : 'Password must be at least 6 characters long.',
      }));

      // Check confirm password match if it exists
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: 'Passwords do not match.',
        }));
      } else if (
        formData.confirmPassword &&
        value === formData.confirmPassword
      ) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: '',
        }));
      }
    }

    if (name === 'confirmPassword') {
      const passwordsMatch = value === formData.password;
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          passwordsMatch || value === '' ? '' : 'Passwords do not match.',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    // Check required fields (suite is optional)
    const requiredFields = [
      'practiceName',
      'providerName',
      'email',
      'password',
      'confirmPassword',
      'npiNumber',
      'address',
      'city',
      'state',
      'zip',
    ];
    requiredFields.forEach((field) => {
      if (!formData[field].trim()) {
        newErrors[field] = 'This field is required.';
      }
    });

    // Additional validations
    if (formData.npiNumber && !/^\d{10}$/.test(formData.npiNumber)) {
      newErrors.npiNumber = 'Invalid NPI Number. It must be 10 digits.';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address.';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      const response = await saveProviderInfo(formData);

      // Store provider ID for next steps
      localStorage.setItem('providerId', response.providerId);

      console.log('Provider info saved successfully');
      navigate('/qualifications');
    } catch (error) {
      console.error('Error submitting provider info:', error.message);
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      // Handle server-side validation errors
      if (error.response && error.response.status === 400) {
        const serverError = error.response.data;
        const errorMessage = serverError.message || error.message;
        
        console.log('Processing server error:', errorMessage);
        
        // Handle specific duplicate field errors
        if (errorMessage === 'Email already exists' || 
            errorMessage === 'User with this email already exists') {
          console.log('Setting email error');
          setErrors(prev => ({
            ...prev,
            email: 'This email address is already registered. Please use a different email.'
          }));
          return; // Don't show alert if we set field error
        } else if (errorMessage === 'NPI Number already exists') {
          console.log('Setting NPI error');
          setErrors(prev => ({
            ...prev,
            npiNumber: 'This NPI Number is already registered. Please verify your NPI Number.'
          }));
          return; // Don't show alert if we set field error
        } else if (errorMessage === 'Provider with this information already exists') {
          // Generic duplicate error - could be either field
          alert('A provider with this information already exists. Please check your email and NPI Number.');
          return;
        } else if (serverError.errors) {
          // Handle field-specific validation errors from server
          const serverErrors = {};
          Object.keys(serverError.errors).forEach(field => {
            serverErrors[field] = serverError.errors[field];
          });
          setErrors(prev => ({ ...prev, ...serverErrors }));
          return;
        } else {
          // Generic error message
          alert(errorMessage || 'Error saving provider information. Please try again.');
          return;
        }
      } else if (error.message && (
          error.message === 'Email already exists' || 
          error.message === 'User with this email already exists')) {
        // Handle case where error message is directly in error.message
        console.log('Setting email error from error.message');
        setErrors(prev => ({
          ...prev,
          email: 'This email address is already registered. Please use a different email.'
        }));
        return;
      } else if (error.message && error.message === 'NPI Number already exists') {
        console.log('Setting NPI error from error.message');
        setErrors(prev => ({
          ...prev,
          npiNumber: 'This NPI Number is already registered. Please verify your NPI Number.'
        }));
        return;
      } else {
        // Network or other errors
        alert('Error saving provider information. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  ];

  return (
    <div className='min-h-screen bg-gradient-to-b from-white via-white to-[#d9dff4]'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-35 pb-8'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
          <div className='lg:col-span-1'>
            <h1
              style={{ fontFamily: 'Montserrat' }}
              className='text-[40px] font-medium text-[#061140] mb-6'
            >
              Provider Portal Account
            </h1>
            <div className='space-y-4'>
              <div className='flex items-start'>
                <div className='md:border-l-3 border-l-[#7F92E5] md:pl-4'>
                  <h2
                    style={{ fontFamily: 'Montserrat' }}
                    className='font-medium text-[16px] text-[#061140]'
                  >
                    Practice Information
                  </h2>
                  <p
                    style={{ fontFamily: 'Karla' }}
                    className='text-sm text-[#484848]'
                  >
                    Share your practice&apos;s name and address details.
                  </p>
                </div>
              </div>
              <div className='flex items-start opacity-50'>
                <div className='md:border-l-3 border-l-[#7E7E7E] md:pl-4 hidden md:block'>
                  <h2
                    style={{ fontFamily: 'Montserrat' }}
                    className='font-medium text-[16px] text-[#7E7E7E]'
                  >
                    Practitioner Qualifications
                  </h2>
                  <p
                    style={{ fontFamily: 'Karla' }}
                    className='text-sm text-[#484848]'
                  >
                    Outline your specialties, certifications, hospital
                    affiliations, and training.
                  </p>
                </div>
              </div>
              <div className='flex items-start opacity-50'>
                <div className='md:border-l-3 border-l-[#7E7E7E] md:pl-4 hidden md:block'>
                  <h2
                    style={{ fontFamily: 'Montserrat' }}
                    className='font-medium text-[16px] text-[#7E7E7E]'
                  >
                    Profile Content
                  </h2>
                  <p
                    style={{ fontFamily: 'Karla' }}
                    className='text-sm text-[#484848]'
                  >
                    Customize your profile with a headshot, image gallery, and
                    customer reviews.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='lg:col-span-2 lg:ml-25'>
            <form
              style={{ fontFamily: 'Karla' }}
              onSubmit={handleSubmit}
              className='space-y-6'
            >
              {/* Practice Name */}
              <div>
                <label
                  htmlFor='practiceName'
                  className={`block text-[16px] font-normal ${
                    errors.practiceName ? `text-[#8D1315]` : `text-[#484848]`
                  }`}
                >
                  Name of Practice
                </label>
                <input
                  type='text'
                  name='practiceName'
                  id='practiceName'
                  value={formData.practiceName}
                  onChange={handleChange}
                  className={`mt-1 block w-full border text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 ${
                    errors.practiceName
                      ? 'border-[#8D1315] text-[#8D1315] focus:ring-[#8D1315] focus:border-[#8D1315]'
                      : 'border-[#7E7E7E] text-[#7E7E7E] focus:ring-[#061140] focus:border-[#061140]'
                  }`}
                  placeholder='Practice'
                />
                {errors.practiceName && (
                  <p className='text-[#8D1315] text-[10px] mt-1'>
                    {errors.practiceName}
                  </p>
                )}
              </div>

              {/* Provider Name */}
              <div>
                <label
                  htmlFor='providerName'
                  className={`block text-[16px] font-normal ${
                    errors.providerName ? `text-[#8D1315]` : `text-[#484848]`
                  }`}
                >
                  Provider / Practitioner Name
                </label>
                <input
                  type='text'
                  name='providerName'
                  id='providerName'
                  value={formData.providerName}
                  onChange={handleChange}
                  className={`mt-1 block w-full border text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 ${
                    errors.providerName
                      ? 'border-[#8D1315] text-[#8D1315] focus:ring-[#8D1315] focus:border-[#8D1315]'
                      : 'border-[#7E7E7E] text-[#7E7E7E] focus:ring-[#061140] focus:border-[#061140]'
                  }`}
                  placeholder='Provider'
                />
                {errors.providerName && (
                  <p className='text-[#8D1315] text-[10px] mt-1'>
                    {errors.providerName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor='email'
                  className={`block text-[16px] font-normal ${
                    errors.email ? `text-[#8D1315]` : `text-[#484848]`
                  }`}
                >
                  Email
                </label>
                <input
                  type='email'
                  name='email'
                  id='email'
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full border text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 ${
                    errors.email
                      ? 'border-[#8D1315] text-[#8D1315] focus:ring-[#8D1315] focus:border-[#8D1315]'
                      : 'border-[#7E7E7E] text-[#7E7E7E] focus:ring-[#061140] focus:border-[#061140]'
                  }`}
                  placeholder='email@example.com'
                />
                {errors.email && (
                  <p className='text-[#8D1315] text-[10px] mt-1'>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Fields */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                <div>
                  <label
                    htmlFor='password'
                    className={`block text-[16px] font-normal ${
                      errors.password ? `text-[#8D1315]` : `text-[#484848]`
                    }`}
                  >
                    Password
                  </label>
                  <input
                    type='password'
                    name='password'
                    id='password'
                    value={formData.password}
                    onChange={handleChange}
                    className={`mt-1 block w-full border text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 ${
                      errors.password
                        ? 'border-[#8D1315] text-[#8D1315] focus:ring-[#8D1315] focus:border-[#8D1315]'
                        : 'border-[#7E7E7E] text-[#7E7E7E] focus:ring-[#061140] focus:border-[#061140]'
                    }`}
                    placeholder='Enter password'
                  />
                  {errors.password && (
                    <p className='text-[#8D1315] text-[10px] mt-1'>
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor='confirmPassword'
                    className={`block text-[16px] font-normal ${
                      errors.confirmPassword
                        ? `text-[#8D1315]`
                        : `text-[#484848]`
                    }`}
                  >
                    Confirm Password
                  </label>
                  <input
                    type='password'
                    name='confirmPassword'
                    id='confirmPassword'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`mt-1 block w-full border text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 ${
                      errors.confirmPassword
                        ? 'border-[#8D1315] text-[#8D1315] focus:ring-[#8D1315] focus:border-[#8D1315]'
                        : 'border-[#7E7E7E] text-[#7E7E7E] focus:ring-[#061140] focus:border-[#061140]'
                    }`}
                    placeholder='Confirm password'
                  />
                  {errors.confirmPassword && (
                    <p className='text-[#8D1315] text-[10px] mt-1'>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* NPI Number */}
              <div>
                <label
                  htmlFor='npiNumber'
                  className={`block text-[16px] font-normal ${
                    errors.npiNumber ? `text-[#8D1315]` : `text-[#484848]`
                  }`}
                >
                  NPI Number
                </label>
                <input
                  type='text'
                  name='npiNumber'
                  id='npiNumber'
                  value={formData.npiNumber}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (
                      !/[0-9]/.test(e.key) &&
                      e.key !== 'Backspace' &&
                      e.key !== 'Tab'
                    ) {
                      e.preventDefault();
                    }
                  }}
                  className={`mt-1 block w-full border text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 ${
                    errors.npiNumber
                      ? 'border-[#8D1315] text-[#8D1315] focus:ring-[#8D1315] focus:border-[#8D1315]'
                      : 'border-[#7E7E7E] text-[#7E7E7E] focus:ring-[#061140] focus:border-[#061140]'
                  }`}
                  placeholder='0000000000'
                  maxLength='10'
                />
                {errors.npiNumber && (
                  <p className='text-[#8D1315] text-[10px] mt-1'>
                    {errors.npiNumber}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor='address'
                  className={`block text-[16px] font-normal ${
                    errors.address ? `text-[#8D1315]` : `text-[#484848]`
                  }`}
                >
                  Address
                </label>
                <input
                  type='text'
                  name='address'
                  id='address'
                  value={formData.address}
                  onChange={handleChange}
                  className={`mt-1 block w-full border text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 ${
                    errors.address
                      ? 'border-[#8D1315] text-[#8D1315] focus:ring-[#8D1315] focus:border-[#8D1315]'
                      : 'border-[#7E7E7E] text-[#7E7E7E] focus:ring-[#061140] focus:border-[#061140]'
                  }`}
                  placeholder='Address'
                />
                {errors.address && (
                  <p className='text-[#8D1315] text-[10px] mt-1'>
                    {errors.address}
                  </p>
                )}
              </div>

              {/* Suite */}
              <div>
                <label
                  htmlFor='suite'
                  className='block text-[16px] font-normal text-[#484848]'
                >
                  Apartment, Suite, etc. (Optional)
                </label>
                <input
                  type='text'
                  name='suite'
                  id='suite'
                  value={formData.suite}
                  onChange={handleChange}
                  className='mt-1 block w-full border text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 border-[#7E7E7E] text-[#7E7E7E] focus:ring-[#061140] focus:border-[#061140]'
                  placeholder='Apartment, Suite, etc.'
                />
              </div>

              {/* City, State, ZIP */}
              <div className='grid grid-cols-1 sm:grid-cols-4 gap-6'>
                <div className='sm:col-span-2'>
                  <label
                    htmlFor='city'
                    className={`block text-[16px] font-normal ${
                      errors.city ? `text-[#8D1315]` : `text-[#484848]`
                    }`}
                  >
                    City
                  </label>
                  <input
                    type='text'
                    name='city'
                    id='city'
                    value={formData.city}
                    onChange={handleChange}
                    className={`mt-1 block w-full border text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 ${
                      errors.city
                        ? 'border-[#8D1315] text-[#8D1315] focus:ring-[#8D1315] focus:border-[#8D1315]'
                        : 'border-[#7E7E7E] text-[#7E7E7E] focus:ring-[#061140] focus:border-[#061140]'
                    }`}
                    placeholder='City'
                  />
                  {errors.city && (
                    <p className='text-[#8D1315] text-[10px] mt-1'>
                      {errors.city}
                    </p>
                  )}
                </div>

                <div className='sm:col-span-1'>
                  <label
                    htmlFor='state'
                    className={`block text-[16px] font-normal ${
                      errors.state ? `text-[#8D1315]` : `text-[#484848]`
                    }`}
                  >
                    State
                  </label>
                  <select
                    name='state'
                    id='state'
                    value={formData.state}
                    onChange={handleChange}
                    className={`mt-1 block w-full border text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 ${
                      errors.state
                        ? 'border-[#8D1315] text-[#8D1315] focus:ring-[#8D1315] focus:border-[#8D1315]'
                        : 'border-[#7E7E7E] text-[#7E7E7E] focus:ring-[#061140] focus:border-[#061140]'
                    }`}
                  >
                    <option value=''>State</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className='text-[#8D1315] text-[10px] mt-1'>
                      {errors.state}
                    </p>
                  )}
                </div>

                <div className='sm:col-span-1'>
                  <label
                    htmlFor='zip'
                    className={`block text-[16px] font-normal ${
                      errors.zip ? `text-[#8D1315]` : `text-[#484848]`
                    }`}
                  >
                    ZIP
                  </label>
                  <input
                    type='text'
                    name='zip'
                    id='zip'
                    value={formData.zip}
                    onChange={handleChange}
                    className={`mt-1 block w-full border text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 ${
                      errors.zip
                        ? 'border-[#8D1315] text-[#8D1315] focus:ring-[#8D1315] focus:border-[#8D1315]'
                        : 'border-[#7E7E7E] text-[#7E7E7E] focus:ring-[#061140] focus:border-[#061140]'
                    }`}
                    placeholder='ZIP'
                    maxLength='5'
                  />
                  {errors.zip && (
                    <p className='text-[#8D1315] text-[10px] mt-1'>
                      {errors.zip}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type='submit'
                  className='w-full sm:w-32 flex justify-center items-center gap-2 py-4 px-4 md:px-20 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#0C1F6D] hover:bg-[#162241]'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className='animate-spin h-5 w-5 text-white'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                          fill='none'
                        />
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                        />
                      </svg>
                      <span>Loading...</span>
                    </>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProviderPortal;