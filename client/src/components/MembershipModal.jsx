import React from 'react';
import { X } from 'lucide-react';
import logo from '../assets/logo.png';

const MembershipModal = ({ onClose, onContinue }) => {
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-3xl shadow-lg relative max-w-md w-full mx-4">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 text-[#0B0757]">
            <img src={logo} alt="Elite Healthspan" className="h-8" />
          </div>
        </div>

        <h2 className="text-center text-2xl font-semibold text-[#0B0757] mb-4">
          What You Get with Your Membership
        </h2>

        <p className="text-center text-gray-600 mb-8">
          Join Elite Healthspan to unlock exclusive access to our network and resources, designed to enhance your wellness journey.
        </p>

        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-start gap-2">
            <span className="text-[#0B0757] mt-1">✔</span>
            <p className="text-gray-700">Connections: Connect with top Providers, Scientists, Practitioners, and Advisors in Alternative Medicine.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[#0B0757] mt-1">✔</span>
            <p className="text-gray-700">Learning: Access state-of-the-art knowledge and insights from industry leaders.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[#0B0757] mt-1">✔</span>
            <p className="text-gray-700">Exploration: Discover innovative therapies, treatments & products that go beyond conventional approaches.</p>
          </div>
        </div>

        <div className="text-center text-gray-700 mb-6">
          <p>Annual Membership (Due Today)</p>
          <p className="text-xl font-semibold text-[#0B0757]">$119.88</p>
          <p>Enjoy a full year of access to Elite Healthspan's premium features and services.</p>
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white text-[#0B0757] rounded-full border border-[#0B0757] font-medium text-base hover:bg-gray-100"
          >
            Back
          </button>
          <button
            onClick={() => onContinue()}
            className="w-full py-3 bg-[#0B0757] text-white rounded-full font-medium text-base hover:bg-[#1a237e]"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembershipModal;