import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleAdminAccess = () => {
    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime > 2000) {
      setClickCount(1);
    } else {
      setClickCount(prev => prev + 1);
    }

    setLastClickTime(currentTime);

    if (clickCount === 4) {
      navigate('/admin/promo-codes');
      setClickCount(0);
    }
  };

  return (
    <footer className="bg-white py-8 mt-auto border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-center text-center sm:text-left gap-4 sm:gap-0">
          {/* Brand Info */}
          <div className="w-full sm:w-auto">
            <h3 className="text-lg font-semibold text-gray-800">Elite Healthspan</h3>
            <p className="text-sm text-gray-600">Your partner in optimal health and longevity</p>
          </div>

          {/* Hidden Admin Dot */}
          <div className="w-full flex justify-center sm:w-auto order-last sm:order-none">
            <button
              onClick={handleAdminAccess}
              className="h-1 w-1 bg-gray-300 rounded-full hover:bg-gray-400 focus:outline-none"
              aria-label="Hidden admin access"
            />
          </div>

          {/* Links */}
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center sm:space-x-6 space-y-2 sm:space-y-0">
            <a href="/about" className="text-sm text-gray-600 hover:text-gray-800">About Us</a>
            <a href="/contact" className="text-sm text-gray-600 hover:text-gray-800">Contact</a>
            <a href="/privacy" className="text-sm text-gray-600 hover:text-gray-800">Privacy Policy</a>
            <a href="/terms" className="text-sm text-gray-600 hover:text-gray-800">Terms of Service</a>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">© 2025 Elite Healthspan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
