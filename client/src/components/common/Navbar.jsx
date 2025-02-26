import React from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import logo from "../../assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showJoinModal, setShowJoinModal] = React.useState(false);
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  const handleJoinClick = () => {
    setShowJoinModal(true);
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const closeModals = () => {
    setShowJoinModal(false);
    setShowLoginModal(false);
  };

  return (
    <nav className="w-full py-4 px-6 flex items-center justify-between fixed top-0 z-50 bg-white shadow-md">
      <div className="text-2xl font-bold text-[#0B0757]">
        <img src={logo} alt="Elite Healthspan" className="h-15" />
      </div>
      
      <div className="hidden md:flex items-center gap-8">
        <a href="#how" className="text-[#64748B] hover:text-[#0B0757] font-medium">How It Works</a>
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
          <a href="#how" className="block py-2 text-[#64748B] hover:text-[#0B0757] font-medium">How It Works</a>
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

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-0 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-lg relative max-w-md w-full mx-4">
            <button 
              onClick={closeModals} 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center gap-2 text-[#0B0757]">
                <img src={logo} alt="" />
              </div>
            </div>
            
            <h2 className="text-center text-2xl font-semibold text-[#0B0757] mb-4">
              Become a member to view<br />
              top-quality longevity services.
            </h2>
            
            <p className="text-center text-gray-600 mb-8">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit,<br />
              sed do eiusmod tempor incididunt ut labore et dolore<br />
              magna aliqua.
            </p>
            
            <div className="flex flex-col gap-4">
              <button
                className="w-full py-3 bg-[#0B0757] text-white rounded-full font-medium text-base"
              >
                Join Elite Healthspan
              </button>
              
              <button
                onClick={() => {
                  closeModals();
                  handleLoginClick();
                }}
                className="w-full py-3 bg-[#D4A017] text-white rounded-full font-medium text-base"
              >
                Login to Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-0 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-lg relative max-w-sm w-full mx-4">
            <button 
              onClick={closeModals} 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-semibold text-[#0B0757] mb-8">Login</h2>
            
            <form className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 text-sm">Email</label>
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 text-sm">Password</label>
                <input 
                  type="password" 
                  placeholder="Password" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]"
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-[#D4A017] text-white rounded-full font-medium text-base mt-4"
              >
                Login
              </button>
            </form>
            
            <p className="text-center text-gray-600 text-sm mt-6">
              New to Elite? Join the waitlist for access.
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