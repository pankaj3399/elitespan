// client/src/components/Navbar.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Menu, X } from 'lucide-react';
import logo from '../../assets/logo.png';
import MembershipModal from '../MembershipModal';
import ContactInfoForm from '../ContactInfoForm';
import PaymentMethodModal from '../PaymentMethodModal';
import CreditCardForm from '../CreditCardForm';
// import PayPalForm from '../PayPalForm'; // Commented out
// import ApplePayForm from '../ApplePayForm'; // Commented out
import { useAuth } from '../../contexts/AuthContext';
// eslint-disable-next-line
import { login, signup } from '../../services/api';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [modalStep, setModalStep] = useState(null);
  const { token, user, loginUser, logoutUser } = useAuth();
  const [loginError, setLoginError] = useState('');
  const [loginCredentials, setLoginCredentials] = useState({ email: '', password: '' });

  const handleJoinClick = () => {
    setModalStep('membership');
  };

  const handleLoginClick = () => {
    setModalStep('login');
  };
  
  const handleClientLoginClick = () => {
    setModalStep('clientLogin');
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
      loginUser(response.token, response.user); // Use loginUser to set token and user
      closeModals();
      alert('Logged in successfully!');
    } catch (error) {
      setLoginError(
        error.message === 'Login failed' || error.message.includes('Invalid')
          ? 'Invalid credentials. If you\'re new, please join Elite Healthspan.'
          : 'Server error during login. Please try again.'
      );
      console.error('Login error:', error);
    }
  };

  const handleLogout = () => {
    logoutUser(); // Use logoutUser to clear token and user
  };

  return (
    <nav className="w-full py-2 px-6 flex items-center justify-between absolute top-0 z-50"> {/*  replaced fixed with absolute */}
      <div className="text-2xl font-bold text-[#0B0757]">
        <img src={logo} alt="Elite Healthspan" className="h-15" />
      </div>

      <div className="hidden md:flex items-center gap-8">
        <Link
          to="/how"
          className="text-[#FFFFFF] hover:text-[#0B0757] font-medium"
        >
          How it works
        </Link>
        <Link
          to="/provider-portal"
          className="text-[#FFFFFF] hover:text-[#0B0757] font-medium"
        >
          Provider Portal
        </Link>
        <Link
          to="/about"
          className="text-[#FFFFFF] hover:text-[#0B0757] font-medium"
        >
          About Elite
        </Link>
        <Link
          to="/faq"
          className="text-[#FFFFFF] hover:text-[#0B0757] font-medium"
        >
          FAQ
        </Link>
        <div className="flex items-center gap-2">
          {token ? (
            <button onClick={handleLogout} className="text-[#FFFFFF] hover:text-[#0B0757] font-medium">
              Logout
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                className="text-[#061140] bg-[#FFFFFF] px-6 py-2 rounded-full hover:text-[#0B0757] font-medium flex items-center gap-1"
              >
                Login
                <svg
                  className={`w-4 h-4 transition-transform ${loginDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {loginDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white shadow-xl rounded-lg z-50 py-4 px-6">
                  <div className="py-2 font-normal text-sm text-[#000000]">For Clients</div>
                  <button
                    onClick={() => {
                      setLoginDropdownOpen(false);
                      handleClientLoginClick(); // You can adjust this to a separate modal if needed
                    }}
                    className="w-full px-4 py-2 text-sm font-bold text-[#FFFFFF] bg-[#BA8E00] rounded-full mb-4 hover:bg-[#c39015]"
                  >
                    Client Login
                  </button>
                  <div className="py-2 font-normal text-sm text-[#000000]">For Providers</div>
                  <Link
                    to="/provider-portal"
                    onClick={() => setLoginDropdownOpen(false)}
                    className="w-full block px-4 py-2 mb-4 text-sm font-bold text-[#FFFFFF] bg-[#0C1F6D] rounded-full hover:bg-[#1a237e] text-center"
                  >
                    Provider Login
                  </Link>
                </div>
              )}
            </div>

          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleJoinClick}
            className="px-6 py-2 bg-[#0B0757] text-white rounded-full hover:bg-[#1a237e] font-medium"
          >
            Join Elite Healthspan
          </motion.button>
        </div>
      </div>

      <button className="md:hidden absolute top-4 right-4 text-[#0B0757] z-50" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X className="w-6 h-6 text-[#0B0757]" /> : <Menu className="w-6 h-6 text-[#0B0757]" />}
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-40 bg-[#FDF8F4] p-6 flex flex-col gap-4 md:hidden"
        >
          <a href="/how" className="block py-2 text-[#061140] hover:text-[#0B0757] font-normal text-[32px] md:font-medium">How it works</a>
          <a href="/provider-portal" className="block py-2 text-[#061140] hover:text-[#0B0757] font-normal text-[32px] md:font-medium">Provider Portal</a>
          <a href="/about" className="block py-2 text-[#061140] hover:text-[#0B0757] font-normal text-[32px] md:font-medium">About Elite</a>
          <a href="/faq" className="block py-2 text-[#061140] hover:text-[#0B0757] font-normal text-[32px] md:font-medium">FAQ</a>
          {token ? (
            <button onClick={handleLogout} className="block py-2 text-[#061140] hover:text-[#0B0757] font-normal text-[32px] md:font-medium">
              Logout
            </button>
          ) : (
            <a
              href="#login"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                handleLoginClick(); // Open login modal
              }}
              className="py-2 text-[#061140] hover:text-[#0B0757] font-normal text-[32px] md:font-medium flex items-center"
            >
              <span>Login</span>
              <ChevronRight className="w-6 h-6 ml-2 mt-2" />
            </a>
          )}
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
          onContinue={() => handleContinue('contactInfo')}
        />
      )}
      {modalStep === 'contactInfo' && (
        <ContactInfoForm
          onClose={closeModals}
          // eslint-disable-next-line
          onContinue={(userId) => handleContinue('paymentMethod')}
          userId={user ? user.id : null}
        />
      )}
      {modalStep === 'paymentMethod' && (
        <PaymentMethodModal
          onClose={closeModals}
          onContinue={(paymentMethod) => handleContinue(`paymentForm_${paymentMethod}`)}
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
      {/* Commented out PayPal modal step */}
      {/* {modalStep === 'paymentForm_payPal' && (
        <PayPalForm
          onClose={closeModals}
          onContinue={closeModals}
          userId={user ? user.id : null}
          token={token}
        />
      )} */}
      {/* Commented out Apple Pay modal step */}
      {/* {modalStep === 'paymentForm_applePay' && (
        <ApplePayForm
          onClose={closeModals}
          onContinue={closeModals}
          userId={user ? user.id : null}
          token={token}
        />
      )} */}
      {modalStep === 'clientLogin' && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-0 flex items-center justify-center z-50">
          <div className="bg-[#FDF9F6] p-8 rounded-3xl shadow-lg relative max-w-sm w-full mx-4">
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
                  required
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
                  required
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
      {modalStep === 'login' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-50 bg-[#FDF8F4] p-6 flex flex-col"
        >
          {/* Top Bar with Back, Title, and Close */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => {
                setModalStep(null);     // close modal
                setIsOpen(true);        // re-open mobile navbar menu
              }}
              className="text-[#0B0757] hover:text-[#1a237e] flex items-center"
            >
              <ChevronLeft className="w-6 h-6 text-[#7E7E7E]" />
            </button>
            <span className="text-base font-normal text-[#061140]">Login</span>
            <button
              onClick={closeModals}
              className="text-[#0B0757] hover:text-[#1a237e]"
            >
              <X className="w-6 h-6 text-[#7E7E7E]" />
            </button>
          </div>
          <div className="flex flex-col gap-10 mt-10">
            {/* For Clients */}
            <div>
              <p className="text-[#061140] text-[32px] font-normal mb-3">For Clients</p>
              <button
                onClick={() => {
                  setModalStep('emailLogin'); // or 'loginForm'
                  handleClientLoginClick(); // open client login modal
                }}
                className="w-full py-4 mb-4 bg-[#BA8E00] text-[#FFFFFF] rounded-full text-base font-bold"
              >
                Client Login
              </button>
            </div>

            {/* For Providers */}
            <div>
              <p className="text-[#061140] text-[32px] font-normal mb-3">For Providers</p>
              <Link
                to="/provider-portal"
                onClick={closeModals}
                className="w-full block text-center py-4 bg-[#0C1F6D] text-[#FFFFFF] rounded-full text-base font-bold"
              >
                Provider Login
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;