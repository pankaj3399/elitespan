import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import logo from "../../assets/logo.png";
import MembershipModal from '../MembershipModal'; // Reintroduced
import ContactInfoForm from '../ContactInfoForm'; // New first step after membership
import PaymentMethodModal from '../PaymentMethodModal'; // New component
import CreditCardForm from '../CreditCardForm'; // Added import
import PayPalForm from '../PayPalForm'; // Added import
import ApplePayForm from '../ApplePayForm'; // Added import
import { useAuth } from '../../contexts/AuthContext'; // Import from AuthContext
import { login, signup } from '../../services/api'; // Import login and signup functions

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalStep, setModalStep] = useState(null); // Track modal steps: 'membership', 'contactInfo', 'paymentMethod', 'paymentForm'
  const { token, setToken } = useAuth(); // Use imported useAuth hook
  const [loginError, setLoginError] = useState('');
  const [loginCredentials, setLoginCredentials] = useState({ email: '', password: '' });

  const handleJoinClick = () => {
    setModalStep('membership'); // Start with membership modal
  };

  const handleLoginClick = () => {
    setModalStep('login');
  };

  const closeModals = () => {
    setModalStep(null);
    setLoginError('');
    setLoginCredentials({ email: '', password: '' });
  };

  const handleContinue = (nextStep) => {
    setModalStep(nextStep);
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = loginCredentials;

    try {
      const response = await login({ email, password });
      setToken(response.token); // Store token in context and localStorage
      closeModals();
      alert('Logged in successfully!');
    } catch (error) {
      if (error.message === 'Login failed') {
        setLoginError(`'Invalid credentials. If you're new, please join Elite Healthspan.'`);
      } else {
        setLoginError('Server error during login. Please try again.');
      }
    }
  };

  return (
    <nav className="w-full py-4 px-6 flex items-center justify-between fixed top-0 z-50 bg-white shadow-md">
      <div className="text-2xl font-bold text-[#0B0757]">
        <img src={logo} alt="Elite Healthspan" className="h-15" />
      </div>
      
      <div className="hidden md:flex items-center gap-8">
        <a href="#how" className="text-[#64748B] hover:text-[#0B0757] font-medium">Our Approach</a>
        <a href="#about" className="text-[#64748B] hover:text-[#0B0757] font-medium">About Elite</a>
        <a href="#faq" className="text-[#64748B] hover:text-[#0B0757] font-medium">FAQ</a>
        <a 
          href="#login" 
          onClick={(e) => {
            e.preventDefault();
            handleLoginClick();
          }} 
          className="text-[#64748B] hover:text-[#0B0757] font-medium cursor-pointer"
        >
          Login
        </a>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleJoinClick}
          className="px-6 py-2 bg-[#0B0757] text-white rounded-full hover:bg-[#1a237e] font-medium"
        >
          Join Elite Healthspan
        </motion.button>
      </div>
      
      <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X className="w-6 h-6 text-[#0B0757]" /> : <Menu className="w-6 h-6 text-[#0B0757]" />}
      </button>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-16 right-0 w-64 bg-white shadow-lg rounded-lg p-4 md:hidden"
        >
          <a href="#how" className="block py-2 text-[#64748B] hover:text-[#0B0757] font-medium">Our Approach</a>
          <a href="#about" className="block py-2 text-[#64748B] hover:text-[#0B0757] font-medium">About Elite</a>
          <a href="#faq" className="block py-2 text-[#64748B] hover:text-[#0B0757] font-medium">FAQ</a>
          <a 
            href="#login" 
            onClick={(e) => {
              e.preventDefault();
              handleLoginClick();
              setIsOpen(false);
            }} 
            className="block py-2 text-[#64748B] hover:text-[#0B0757] font-medium"
          >
            Login
          </a>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              handleJoinClick();
              setIsOpen(false);
            }}
            className="mt-4 w-full py-2 text-[#0B0757] font-semibold border border-[#0B0757] rounded-full hover:bg-[#0B0757] hover:text-white"
          >
            Join Elite Healthspan
          </motion.button>
        </motion.div>
      )}

      {/* Modals */}
      {modalStep === 'membership' && (
        <MembershipModal 
          onClose={closeModals} 
          onContinue={() => handleContinue('contactInfo')} // Proceed to contact info after membership
        />
      )}
      {modalStep === 'contactInfo' && (
        <ContactInfoForm 
          onClose={closeModals} 
          onContinue={(userId) => handleContinue('paymentMethod')} // Pass userId after signup
          userId={null} // Start with no userId, create one in ContactInfoForm
        />
      )}
      {modalStep === 'paymentMethod' && (
        <PaymentMethodModal 
          onClose={closeModals} 
          onContinue={(paymentMethod) => handleContinue(`paymentForm_${paymentMethod}`)} 
          userId={token ? JSON.parse(atob(token.split('.')[1])).id : null} // Use userId from contact info
        />
      )}
      {modalStep === 'paymentForm_creditCard' && (
        <CreditCardForm 
          onClose={closeModals} 
          onContinue={closeModals} // Payment completes signup, close modal
          userId={token ? JSON.parse(atob(token.split('.')[1])).id : null} // Use userId from contact info
          token={token} // Pass token for authenticated requests
        />
      )}
      {modalStep === 'paymentForm_payPal' && (
        <PayPalForm 
          onClose={closeModals} 
          onContinue={closeModals} // Payment completes signup, close modal
          userId={token ? JSON.parse(atob(token.split('.')[1])).id : null} 
          token={token} // Pass token for authenticated requests
        />
      )}
      {modalStep === 'paymentForm_applePay' && (
        <ApplePayForm 
          onClose={closeModals} 
          onContinue={closeModals} // Payment completes signup, close modal
          userId={token ? JSON.parse(atob(token.split('.')[1])).id : null} 
          token={token} // Pass token for authenticated requests
        />
      )}
      {modalStep === 'login' && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-0 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-lg relative max-w-sm w-full mx-4">
            <button 
              onClick={closeModals} 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-semibold text-[#0B0757] mb-8">Login</h2>
            
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 text-sm">Email</label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email Address" 
                  value={loginCredentials.email}
                  onChange={handleLoginChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 text-sm">Password</label>
                <input 
                  type="password" 
                  name="password"
                  placeholder="Password" 
                  value={loginCredentials.password}
                  onChange={handleLoginChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]"
                />
              </div>
              
              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
              
              <button
                type="submit"
                className="w-full py-3 bg-[#D4A017] text-white rounded-full font-medium text-base mt-4"
              >
                Login
              </button>
            </form>
            
            <p className="text-center text-gray-600 text-sm mt-6">
              New to Elite? {loginError.includes('new') ? (
                <button
                  onClick={() => {
                    closeModals();
                    handleJoinClick();
                  }}
                  className="text-[#0B0757] underline hover:text-[#1a237e]"
                >
                  Join Elite Healthspan
                </button>
              ) : 'Join the waitlist for access.'}
            </p>
            
            <button
              onClick={() => {
                closeModals();
                handleJoinClick();
              }}
              className="w-full py-3 bg-[#0B0757] text-white rounded-full font-medium text-base mt-4"
            >
              Join Elite Healthspan
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}; // Added this closing curly brace and semicolon

export default Navbar;