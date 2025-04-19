// client/src/components/Navbar.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, LogIn } from 'lucide-react';
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

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
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
        {token ? (
          <button onClick={handleLogout} className="text-[#FFFFFF] hover:text-[#0B0757] font-medium">
            Logout
          </button>
        ) : (
          <a
            href="#login"
            onClick={(e) => {
              e.preventDefault();
              handleLoginClick();
            }}
            className="text-[#FFFFFF] hover:text-[#0B0757] font-medium flex items-center"
          >
            <LogIn className="w-4 h-4 mr-1" /> Login
          </a>
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
                handleLoginClick();
                setIsOpen(false);
              }}
              className="py-2 text-[#061140] hover:text-[#0B0757] font-normal text-[32px] md:font-medium flex items-center"
            >
              <LogIn className="w-4 h-4 mr-1" /> Login
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
    </nav>
  );
};

export default Navbar;