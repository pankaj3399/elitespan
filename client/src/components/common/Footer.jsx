import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleAdminAccess = () => {
    const currentTime = new Date().getTime();
    
    // Reset click count if more than 2 seconds between clicks
    if (currentTime - lastClickTime > 2000) {
      setClickCount(1);
    } else {
      setClickCount(clickCount + 1);
    }
    
    setLastClickTime(currentTime);
    
    // Navigate to admin page after 5 rapid clicks
    if (clickCount === 1) {
      navigate('/admin/promo-codes');
      setClickCount(0);
    }
  };

  return (
    <footer className="bg-white py-8 mt-auto border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-gray-800">Elite Healthspan</h3>
            <p className="text-sm text-gray-600">Your partner in optimal health and longevity</p>
          </div>
          
          {/* Hidden admin button disguised as a dot/period */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <button
              onClick={handleAdminAccess}
              className="h-1 w-1 bg-gray-300 rounded-full hover:bg-gray-400 focus:outline-none"
              aria-label="Hidden admin access"
            />
          </div>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
            <a href="/about" className="text-sm text-gray-600 hover:text-gray-800">About Us</a>
            <a href="/contact" className="text-sm text-gray-600 hover:text-gray-800">Contact</a>
            <a href="/privacy" className="text-sm text-gray-600 hover:text-gray-800">Privacy Policy</a>
            <a href="/terms" className="text-sm text-gray-600 hover:text-gray-800">Terms of Service</a>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">© 2025 Elite Healthspan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;