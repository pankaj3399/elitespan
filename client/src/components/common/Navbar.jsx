// client/src/components/Navbar.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Menu, X } from 'lucide-react';
import MembershipModal from '../MembershipModal';
import ContactInfoForm from '../ContactInfoForm';
import PaymentMethodModal from '../PaymentMethodModal';
import CreditCardForm from '../CreditCardForm';
import { useAuth } from '../../contexts/AuthContext';
import { login } from '../../services/api';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
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
      loginUser(response.token, response.user); // AuthContext handles role-based routing
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
  };

  // Helper function to determine what to show based on auth status
  const renderAuthButtons = () => {
    if (token && user) {
      // User is logged in
      return (
        <div className='flex items-center gap-4'>
          <span className='text-[#FFFFFF] text-sm'>Welcome, {user.name}</span>
          <button
            onClick={handleLogout}
            className='text-[#061140] bg-[#FFFFFF] px-6 py-2 rounded-full hover:text-[#0B0757] font-medium'
          >
            Logout
          </button>
        </div>
      );
    } else {
      // User is not logged in
      return (
        <>
          <button
            onClick={handleLoginClick}
            className='text-[#061140] bg-[#FFFFFF] px-6 py-2 rounded-full hover:text-[#0B0757] font-medium'
          >
            Login
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleJoinClick}
            className='px-6 py-3 bg-[#0C1F6D] text-white rounded-full hover:bg-[#1a237e] font-medium'
          >
            Join Elite Healthspan
          </motion.button>
        </>
      );
    }
  };

  // Helper function for mobile auth buttons
  const renderMobileAuthButtons = () => {
    if (token && user) {
      // User is logged in
      return (
        <>
          <div className='py-2 text-[#061140] font-normal text-[24px]'>
            Welcome, {user.name}
          </div>
          <button
            onClick={handleLogout}
            className='py-2 text-[#061140] hover:text-[#0B0757] font-normal text-[32px] md:font-medium flex items-center'
          >
            <span>Logout</span>
          </button>
        </>
      );
    } else {
      // User is not logged in
      return (
        <>
          <a
            href='#login'
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
              handleLoginClick();
            }}
            className='py-2 text-[#061140] hover:text-[#0B0757] font-normal text-[32px] md:font-medium flex items-center'
          >
            <span>Login</span>
            <ChevronRight className='w-6 h-6 ml-2 mt-2' />
          </a>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              handleJoinClick();
              setIsOpen(false);
            }}
            className='block py-2 text-[#061140] hover:text-[#0B0757] font-normal text-[32px] md:font-medium text-left'
          >
            Join Elite Healthspan
          </motion.button>
        </>
      );
    }
  };

  return (
    <nav className='w-full py-2 px-6 sm:px-12 flex items-center justify-between absolute top-0 z-50 mt-4'>
      <div className='text-2xl font-bold text-[#0B0757] flex items-center gap-2'>
        <img src={logo} alt='Elite Healthspan' className='h-6 sm:h-8' />
        <span className='sm:text-2xl text-base font-light text-[#FFFFFF]/90 font-karla tracking-wider'>
          ELITE HEALTHSPAN
        </span>
      </div>
      <div className='hidden md:flex items-center gap-8'>
        <Link
          to='/how'
          style={{ fontFamily: 'Karla' }}
          className='text-[#FFFFFF] hover:text-[#0B0757] font-medium'
        >
          How It Works
        </Link>
        <Link
          to='/about'
          style={{ fontFamily: 'Karla' }}
          className='text-[#FFFFFF] hover:text-[#0B0757] font-medium'
        >
          About Elite
        </Link>
        <Link
          to='/faq'
          style={{ fontFamily: 'Karla' }}
          className='text-[#FFFFFF] hover:text-[#0B0757] font-medium'
        >
          FAQ
        </Link>

        {/* Only show Provider Sign Up if user is not logged in */}
        {!token && (
          <Link
            to='/provider-portal'
            style={{ fontFamily: 'Karla' }}
            className='text-[#FFFFFF] hover:text-[#0B0757] font-medium'
          >
            Provider Sign Up
          </Link>
        )}

        <div
          style={{ fontFamily: 'Karla' }}
          className='flex items-center gap-2'
        >
          {renderAuthButtons()}
        </div>
      </div>

      <button
        className='md:hidden absolute right-4 text-[#0B0757] z-50'
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className='w-6 h-6 text-[#0B0757]' />
        ) : (
          <Menu className='w-6 h-6 text-[#FFFFFF]' />
        )}
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{ fontFamily: 'Montserrat' }}
          className='fixed inset-0 z-40 bg-[#FDF8F4] p-6 flex flex-col gap-4 md:hidden'
        >
          <a
            href='/how'
            className='block py-2 text-[#061140] hover:text-[#0B0757] font-normal text-[32px] md:font-medium'
          >
            How it works
          </a>
          <a
            href='/about'
            className='block py-2 text-[#061140] hover:text-[#0B0757] font-normal text-[32px] md:font-medium'
          >
            About Elite
          </a>
          <a
            href='/faq'
            className='block py-2 text-[#061140] hover:text-[#0B0757] font-normal text-[32px] md:font-medium'
          >
            FAQ
          </a>

          {/* Only show Provider Sign Up in mobile if user is not logged in */}
          {!token && (
            <Link
              to='/provider-portal'
              className='block py-2 text-[#061140] hover:text-[#0B0757] font-normal text-[32px] md:font-medium'
              onClick={() => setIsOpen(false)}
            >
              Provider Sign Up
            </Link>
          )}

          {renderMobileAuthButtons()}
        </motion.div>
      )}

      {/* Modals - Only show if user is not logged in */}
      {!token && modalStep === 'membership' && (
        <MembershipModal
          onClose={closeModals}
          onContinue={() => handleContinue('contactInfo')}
        />
      )}
      {!token && modalStep === 'contactInfo' && (
        <ContactInfoForm
          onClose={closeModals}
          onContinue={(userId) => handleContinue('paymentMethod')}
          userId={user ? user.id : null}
        />
      )}
      {!token && modalStep === 'paymentMethod' && (
        <PaymentMethodModal
          onClose={closeModals}
          onContinue={(paymentMethod) =>
            handleContinue(`paymentForm_${paymentMethod}`)
          }
          userId={user ? user.id : null}
        />
      )}
      {!token && modalStep === 'paymentForm_creditCard' && (
        <CreditCardForm
          onClose={closeModals}
          onContinue={closeModals}
          userId={user ? user.id : null}
          token={token}
        />
      )}

      {/* Login Modal - Only show if user is not logged in */}
      {!token && modalStep === 'login' && (
        <div
          style={{ fontFamily: 'Montserrat' }}
          className='fixed inset-0 backdrop-blur-md bg-opacity-0 flex items-center justify-center z-50'
        >
          <div className='bg-[#FDF9F6] p-8 rounded-3xl shadow-lg relative max-w-sm w-full mx-4'>
            <button
              onClick={closeModals}
              className='absolute top-4 right-4 text-gray-500 hover:text-gray-700'
            >
              <X className='w-6 h-6' />
            </button>

            <h2 className='text-2xl font-semibold text-[#0B0757] mb-8'>
              Login
            </h2>

            <form
              style={{ fontFamily: 'Karla' }}
              onSubmit={handleLoginSubmit}
              className='flex flex-col gap-4'
            >
              <div className='flex flex-col gap-2'>
                <label className='text-gray-700 text-sm'>Email</label>
                <input
                  type='email'
                  name='email'
                  placeholder='Email Address'
                  value={loginCredentials.email}
                  onChange={handleLoginChange}
                  style={{ fontFamily: 'Karla' }}
                  className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]'
                  required
                />
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-gray-700 text-sm'>Password</label>
                <input
                  type='password'
                  name='password'
                  placeholder='Password'
                  value={loginCredentials.password}
                  onChange={handleLoginChange}
                  style={{ fontFamily: 'Karla' }}
                  className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]'
                  required
                />
              </div>

              {loginError && (
                <p className='text-red-500 text-sm'>{loginError}</p>
              )}

              <button
                type='submit'
                className='w-full py-3 bg-[#D4A017] text-white rounded-full font-medium text-base mt-4'
              >
                Login
              </button>
            </form>

            <p className='text-center text-gray-600 text-sm mt-6'>
              New to Elite?{' '}
              <button
                onClick={() => {
                  closeModals();
                  handleJoinClick();
                }}
                className='text-[#0B0757] underline hover:text-[#1a237e]'
              >
                Join Elite Healthspan
              </button>
            </p>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
