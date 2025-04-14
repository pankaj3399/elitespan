// client/src/components/ContactInfoForm.jsx
import { useState } from 'react';
import { X } from 'lucide-react';
import { signup, login } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// eslint-disable-next-line react/prop-types, no-unused-vars
const ContactInfoForm = ({ onClose, onContinue, userId }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const { loginUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!terms) {
      setError('You must agree to the Terms & Services');
      return;
    }

    // Validate inputs
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

    const payload = {
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim(),
      password: password.trim(),
      contactInfo: {
        phone: phoneNumber.trim() || '',
        address: address.trim() || '',
      },
    };
    console.log('Signup payload:', JSON.stringify(payload, null, 2));

    try {
      let response;
      // Try to log in the user first
      try {
        response = await login({ email: email.trim(), password: password.trim() });
        console.log('Login response:', response);
        if (!response.user || !response.user.id) {
          throw new Error('Login response does not contain user ID');
        }
        loginUser(response.token, response.user);
        onContinue(response.user.id);
      } catch (loginError) {
        console.log('Login failed, proceeding with signup:', loginError.message);
        // If login fails (user doesn't exist), proceed with signup
        response = await signup(payload);
        console.log('Signup response:', response);
        if (!response.user || !response.user.id) {
          throw new Error('Signup response does not contain user ID');
        }
        // Use the token and user data from signup directly
        loginUser(response.token, response.user);
        onContinue(response.user.id);
      }
    } catch (err) {
      // Parse the error response for specific messages
      if (err.message && err.message.includes('{')) {
        try {
          const errorData = JSON.parse(err.message);
          setError(errorData.message || 'Signup failed');
        // eslint-disable-next-line no-unused-vars
        } catch (parseError) {
          setError('Signup failed due to an unknown error');
        }
      } else {
        setError(err.message || 'Server error during signup/login');
      }
      console.error('Error in signup/login:', err);
    }
  };

  // Inline styles for scrollbar
  const formContainerStyle = {
    maxHeight: '400px',
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(11, 7, 87, 0.1) transparent',
  };

  // Add webkit scrollbar styles directly to a style tag
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
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-0 flex items-center justify-center z-50">
      <style>{scrollbarStyles}</style>
      <div className="bg-white p-8 rounded-3xl shadow-lg relative max-w-md w-full mx-4">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-semibold text-[#0B0757] mb-4">Contact Information</h2>

        <p className="text-center text-gray-600 mb-8">
          Please provide your contact details to join Elite Healthspan. This information will help us personalize your experience and connect you with our network of providers.
        </p>

        <div className="form-container" style={formContainerStyle}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-gray-700 text-sm">First Name</label>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]"
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-gray-700 text-sm">Last Name</label>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-700 text-sm">Email</label>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-700 text-sm">Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-700 text-sm">Phone Number</label>
              <input
                type="tel"
                placeholder="000-000-0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-700 text-sm">Address</label>
              <input
                type="text"
                placeholder="Address (Optional)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="w-4 h-4 text-[#0B0757] border-gray-200 rounded focus:ring-[#0B0757]"
              />
              <label className="text-gray-700 text-sm">Use this information when contacting providers & clinics.</label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="w-4 h-4 text-[#0B0757] border-gray-200 rounded focus:ring-[#0B0757]"
              />
              <label className="text-gray-700 text-sm">By joining, you agree to our Terms & Services.</label>
            </div>
          </form>
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        <div className="flex justify-between gap-4 mt-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white text-[#0B0757] rounded-full border border-[#0B0757] font-medium text-base hover:bg-gray-100"
          >
            Back
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full py-3 bg-[#0B0757] text-white rounded-full font-medium text-base hover:bg-[#1a237e]"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoForm;