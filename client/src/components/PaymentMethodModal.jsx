import React from 'react';
import { X } from 'lucide-react';

const PaymentMethodModal = ({ onClose, onContinue, userId }) => {
  const handlePaymentMethodSelect = (method) => {
    onContinue(method);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-0 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-3xl shadow-lg relative max-w-md w-full mx-4">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-semibold text-[#0B0757] mb-4">Choose Payment Method</h2>
        
        <p className="text-center text-gray-600 mb-8">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        
        <div className="flex flex-col gap-4 mb-8">
          <button
            onClick={() => handlePaymentMethodSelect('creditCard')}
            className="w-full py-3 bg-white text-[#0B0757] border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-50"
          >
            <span className="flex items-center gap-2">
              <span className="text-2xl">💳</span> Credit Card
            </span>
            <span className="text-[#0B0757]">➔</span>
          </button>
          <button
            onClick={() => handlePaymentMethodSelect('payPal')}
            className="w-full py-3 bg-white text-[#0B0757] border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-50"
          >
            <span className="flex items-center gap-2">
              <span className="text-2xl">💸</span> PayPal
            </span>
            <span className="text-[#0B0757]">➔</span>
          </button>
          <button
            onClick={() => handlePaymentMethodSelect('applePay')}
            className="w-full py-3 bg-white text-[#0B0757] border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-50"
          >
            <span className="flex items-center gap-2">
              <span className="text-2xl">🍏</span> Apple Pay
            </span>
            <span className="text-[#0B0757]">➔</span>
          </button>
        </div>
        
        <div className="flex justify-between gap-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white text-[#0B0757] rounded-full border border-[#0B0757] font-medium text-base hover:bg-gray-100"
          >
            Back
          </button>
          <button
            disabled
            className="w-full py-3 bg-gray-300 text-gray-500 rounded-full font-medium text-base cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodModal;