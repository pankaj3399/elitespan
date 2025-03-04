// client/src/components/ApplePayForm.jsx

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentIntent, confirmPayment } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const ApplePayForm = ({ onClose, onContinue, userId, token: propToken }) => {
  const [error, setError] = useState('');
  const [paymentIntent, setPaymentIntent] = useState(null);
  const { token: contextToken } = useAuth(); // Use token from AuthContext as fallback

  const finalToken = propToken || contextToken; // Use propToken if provided, otherwise contextToken

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      if (!finalToken) {
        setError('Please ensure you’re logged in or joined to make a payment.');
        return;
      }

      try {
        const response = await createPaymentIntent(finalToken, { amount: 9.99, userId, doctorId: null });
        setPaymentIntent(response);
      } catch (err) {
        setError(err.message || 'Payment intent creation failed. Please ensure you’re logged in.');
      }
    };
    fetchPaymentIntent();
  }, [userId, finalToken]);

  const handleApplePay = async () => {
    if (!finalToken) {
      setError('Please ensure you’re logged in or joined to make a payment.');
      return;
    }

    try {
      const stripe = await stripePromise;
      const { error } = await stripe.confirmApplePayPayment(paymentIntent.clientSecret, {
        country: 'US',
        currency: 'usd',
        total: {
          label: 'Elite Healthspan Membership',
          amount: 9.99,
        },
      });

      if (error) throw new Error(error.message);

      const paymentResponse = await confirmPayment(finalToken, { paymentIntentId: paymentIntent.clientSecret });
      if (paymentResponse.message === 'Payment confirmed') {
        onContinue(); // Complete signup, close modal
      }
    } catch (err) {
      setError(err.message);
    }
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
        
        <h2 className="text-2xl font-semibold text-[#0B0757] mb-4">Apple Pay</h2>
        
        <p className="text-center text-gray-600 mb-8">
          Use Apple Pay to complete your payment securely. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <div className="flex justify-between gap-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white text-[#0B0757] rounded-full border border-[#0B0757] font-medium text-base hover:bg-gray-100"
          >
            Back
          </button>
          <button
            onClick={handleApplePay}
            className="w-full py-3 bg-[#0B0757] text-white rounded-full font-medium text-base hover:bg-[#1a237e]"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplePayForm;