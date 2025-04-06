import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const handleAdminPortalClick = () => {
    navigate('/admin/promo-codes'); // Redirect to admin login page
  };

  return (
    <footer className="bg-white py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-600">© 2025 Elite Healthspan. All rights reserved.</p>
        <button
          onClick={handleAdminPortalClick}
          className="mt-2 px-0.5 py-0.5 bg-[#0B0757] text-white text-[8px] rounded-full hover:bg-[#1a237e] transition-colors"
          title="Admin Access (Restricted)"
        >
          Admin Portal
        </button>
      </div>
    </footer>
  );
};

export default Footer;