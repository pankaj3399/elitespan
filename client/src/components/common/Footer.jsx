import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'lucide-react'; // Using lucide-react for the link icon

const Footer = () => {
  const navigate = useNavigate();

  const handleAdminPortalClick = () => {
    navigate('/admin/promo-codes'); // Redirect to admin login page
  };

  return (
    <footer className="bg-white py-6 mt-auto border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Left Section: General Info and Links */}
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-gray-600 text-sm">© 2025 Elite Healthspan. All rights reserved.</p>
            <div className="mt-2 text-sm text-gray-500">
              <a href="/about" className="hover:text-[#0B0757] mr-4">About Us</a>
              <a href="/contact" className="hover:text-[#0B0757] mr-4">Contact</a>
              <a href="/privacy" className="hover:text-[#0B0757]">Privacy Policy</a>
            </div>
          </div>

          {/* Right Section: Admin Button */}
          <div className="text-right">
            <button
              onClick={handleAdminPortalClick}
              className="text-gray-500 hover:text-[#0B0757] text-xs flex items-center gap-1"
              title="Admin Access (Restricted)"
            >
              Admin <Link className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Additional Footer Content */}
        <div className="mt-4 text-center text-gray-400 text-xs">
          <p>Follow us: 
            <a href="https://twitter.com/elitehealthspan" className="ml-2 hover:text-[#0B0757]">Twitter</a> | 
            <a href="https://facebook.com/elitehealthspan" className="ml-2 hover:text-[#0B0757]">Facebook</a>
          </p>
          <p className="mt-1">Customer Support: support@elitehealthspan.com</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;