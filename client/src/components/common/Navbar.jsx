// client/src/components/Navbar.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import MembershipModal from '../MembershipModal';
import ContactInfoForm from '../ContactInfoForm';
import PaymentMethodModal from '../PaymentMethodModal';
import CreditCardForm from '../CreditCardForm';
import { useAuth } from '../../contexts/AuthContext';
import { login } from '../../services/api';
import { Link } from 'react-router-dom';
import logo from '../../assets/Frame.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalStep, setModalStep] = useState(null);
  const { token, user, loginUser, logoutUser } = useAuth();
  const [loginError, setLoginError] = useState('');
  const [loginCredentials, setLoginCredentials] = useState({
    email: '',
    password: '',
  });

  const handleJoinClick = () => {
    setModalStep('membership');
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
    setLoginCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = loginCredentials;

    try {
      const response = await login({ email, password });
      console.log('Login response:', response);
      loginUser(response.token, response.user);
      closeModals();
      alert('Logged in successfully!');
    } catch (error) {
      setLoginError(
        error.message === 'Login failed' || error.message.includes('Invalid')
          ? "Invalid credentials. If you're new, please join Elite Healthspan."
          : 'Server error during login. Please try again.'
      );
      console.error('Login error:', error);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setIsOpen(false); // Close mobile menu if open
  };

  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className='w-full bg-white shadow-lg relative z-40 border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16 lg:h-20'>
            {/* Logo */}
            <Link to='/' className='flex items-center gap-3 flex-shrink-0'>
              <img src={logo} alt='Elite Healthspan' className='h-8 lg:h-10' />
              <span
                style={{ fontFamily: 'Karla' }}
                className='text-lg lg:text-xl font-light text-[#0B0757] tracking-wider hidden sm:block'
              >
                ELITE HEALTHSPAN
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className='hidden lg:flex items-center space-x-8 ml-auto mr-8'>
              <Link
                to='/how'
                style={{ fontFamily: 'Karla' }}
                className='text-[#0B0757] hover:text-[#0C1F6D] transition-colors duration-200 font-medium'
              >
                How It Works
              </Link>
              <Link
                to='/about'
                style={{ fontFamily: 'Karla' }}
                className='text-[#0B0757] hover:text-[#0C1F6D] transition-colors duration-200 font-medium'
              >
                About Elite
              </Link>
              <Link
                to='/faq'
                style={{ fontFamily: 'Karla' }}
                className='text-[#0B0757] hover:text-[#0C1F6D] transition-colors duration-200 font-medium'
              >
                FAQ
              </Link>

              {/* Only show Provider Sign Up if user is not logged in */}
              {!token && (
                <Link
                  to='/provider-portal'
                  style={{ fontFamily: 'Karla' }}
                  className='text-[#0B0757] hover:text-[#0C1F6D] transition-colors duration-200 font-medium'
                >
                  Provider Sign Up
                </Link>
              )}
            </div>

            {/* Desktop Auth Buttons */}
            <div className='hidden lg:flex items-center space-x-4'>
              {token && user ? (
                <>
                  <span
                    style={{ fontFamily: 'Karla' }}
                    className='text-[#0B0757] text-sm'
                  >
                    Hi, {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    style={{ fontFamily: 'Karla' }}
                    className='bg-[#0B0757] text-white px-6 py-2 rounded-full hover:bg-[#0C1F6D] transition-colors duration-200 font-medium'
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleLoginClick}
                    style={{ fontFamily: 'Karla' }}
                    className='bg-[#0B0757] text-white px-6 py-2 rounded-full hover:bg-[#0C1F6D] transition-colors duration-200 font-medium'
                  >
                    Login
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleJoinClick}
                    style={{ fontFamily: 'Karla' }}
                    className='bg-[#D4A017] text-white px-6 py-2 rounded-full hover:bg-[#B8901A] transition-colors duration-200 font-medium'
                  >
                    Join Elite
                  </motion.button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className='lg:hidden p-2 rounded-md text-[#0B0757] hover:bg-gray-100 transition-colors duration-200'
            >
              {isOpen ? (
                <X className='h-6 w-6' />
              ) : (
                <Menu className='h-6 w-6' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className='lg:hidden bg-white border-t border-gray-200 shadow-lg'
            >
              <div className='px-4 py-4 space-y-4'>
                {/* Mobile Navigation Links */}
                <Link
                  to='/how'
                  onClick={closeMobileMenu}
                  style={{ fontFamily: 'Karla' }}
                  className='block text-[#0B0757] hover:text-[#0C1F6D] transition-colors duration-200 font-medium py-2'
                >
                  How It Works
                </Link>
                <Link
                  to='/about'
                  onClick={closeMobileMenu}
                  style={{ fontFamily: 'Karla' }}
                  className='block text-[#0B0757] hover:text-[#0C1F6D] transition-colors duration-200 font-medium py-2'
                >
                  About Us
                </Link>
                <Link
                  to='/faq'
                  onClick={closeMobileMenu}
                  style={{ fontFamily: 'Karla' }}
                  className='block text-[#0B0757] hover:text-[#0C1F6D] transition-colors duration-200 font-medium py-2'
                >
                  FAQ
                </Link>

                {/* Only show Provider Sign Up in mobile if user is not logged in */}
                {!token && (
                  <Link
                    to='/provider-portal'
                    onClick={closeMobileMenu}
                    style={{ fontFamily: 'Karla' }}
                    className='block text-[#0B0757] hover:text-[#0C1F6D] transition-colors duration-200 font-medium py-2'
                  >
                    Provider Sign Up
                  </Link>
                )}

                {/* Mobile Auth Section */}
                <div className='pt-4 border-t border-gray-200'>
                  {token && user ? (
                    <>
                      <div
                        style={{ fontFamily: 'Karla' }}
                        className='text-[#0B0757] text-sm mb-4'
                      >
                        Hi, {user.name}
                      </div>
                      <button
                        onClick={handleLogout}
                        style={{ fontFamily: 'Karla' }}
                        className='w-full bg-[#0B0757] text-white py-3 px-6 rounded-full hover:bg-[#0C1F6D] transition-colors duration-200 font-medium'
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className='space-y-3'>
                      <button
                        onClick={() => {
                          handleLoginClick();
                          closeMobileMenu();
                        }}
                        style={{ fontFamily: 'Karla' }}
                        className='w-full bg-[#0B0757] text-white py-3 px-6 rounded-full hover:bg-[#0C1F6D] transition-colors duration-200 font-medium'
                      >
                        Login
                      </button>
                      <button
                        onClick={() => {
                          handleJoinClick();
                          closeMobileMenu();
                        }}
                        style={{ fontFamily: 'Karla' }}
                        className='w-full bg-[#D4A017] text-white py-3 px-6 rounded-full hover:bg-[#B8901A] transition-colors duration-200 font-medium'
                      >
                        Join Elite Healthspan
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Modals - Only show if user is not logged in */}
      {modalStep === 'membership' && (
        <MembershipModal
          onClose={closeModals}
          onContinue={() => handleContinue('contactInfo')}
        />
      )}
      {modalStep === 'contactInfo' && (
        <ContactInfoForm
          onClose={closeModals}
          onContinue={(userId) => handleContinue('paymentMethod')}
          userId={user ? user.id : null}
        />
      )}
      {modalStep === 'paymentMethod' && (
        <PaymentMethodModal
          onClose={closeModals}
          onContinue={(paymentMethod) =>
            handleContinue(`paymentForm_${paymentMethod}`)
          }
          userId={user ? user.id : null}
        />
      )}
      {modalStep === 'paymentForm_creditCard' && (
        <CreditCardForm
          onClose={closeModals}
          onContinue={closeModals}
          userId={user ? user.id : null}
          token={token}
        />
      )}
      {/* Login Modal - Only show if user is not logged in */}
      {!token && modalStep === 'login' && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ fontFamily: 'Montserrat' }}
            className='bg-white rounded-2xl shadow-xl relative max-w-md w-full p-8'
          >
            <button
              onClick={closeModals}
              className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors'
            >
              <X className='w-6 h-6' />
            </button>

            <h2 className='text-2xl font-semibold text-[#0B0757] mb-8'>
              Login
            </h2>

            <form onSubmit={handleLoginSubmit} className='space-y-4'>
              <div>
                <label
                  style={{ fontFamily: 'Karla' }}
                  className='block text-gray-700 text-sm font-medium mb-2'
                >
                  Email
                </label>
                <input
                  type='email'
                  name='email'
                  placeholder='Email Address'
                  value={loginCredentials.email}
                  onChange={handleLoginChange}
                  style={{ fontFamily: 'Karla' }}
                  className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B0757] focus:border-transparent transition-all'
                  required
                />
              </div>

              <div>
                <label
                  style={{ fontFamily: 'Karla' }}
                  className='block text-gray-700 text-sm font-medium mb-2'
                >
                  Password
                </label>
                <input
                  type='password'
                  name='password'
                  placeholder='Password'
                  value={loginCredentials.password}
                  onChange={handleLoginChange}
                  style={{ fontFamily: 'Karla' }}
                  className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B0757] focus:border-transparent transition-all'
                  required
                />
              </div>

              {loginError && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                  <p className='text-red-600 text-sm'>{loginError}</p>
                </div>
              )}

              <button
                type='submit'
                style={{ fontFamily: 'Karla' }}
                className='w-full bg-[#D4A017] text-white py-3 px-6 rounded-lg hover:bg-[#B8901A] transition-colors duration-200 font-medium mt-6'
              >
                Login
              </button>
            </form>

            <div className='mt-6 text-center'>
              <p
                style={{ fontFamily: 'Karla' }}
                className='text-gray-600 text-sm'
              >
                New to Elite?{' '}
                <button
                  onClick={() => {
                    closeModals();
                    handleJoinClick();
                  }}
                  className='text-[#0B0757] font-medium hover:text-[#1a237e] transition-colors'
                >
                  Join Elite Healthspan
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Navbar;
