// client/src/components/CreditCardForm.jsx

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentIntent, confirmPayment } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CreditCardForm = ({ onClose, onContinue, userId, token: propToken }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [country, setCountry] = useState('US'); // Default to US
  const [zip, setZip] = useState('');
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
        console.log('Fetching payment intent with token:', finalToken); // Debug token
        const response = await createPaymentIntent(finalToken, { amount: 9.99, userId, doctorId: null });
        setPaymentIntent(response);
      } catch (err) {
        setError(err.message || 'Payment intent creation failed. Please ensure you’re logged in.');
        console.error('Payment intent error:', err); // Log error for debugging
      }
    };
    fetchPaymentIntent();
  }, [userId, finalToken]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!finalToken) {
      setError('Please ensure you’re logged in or joined to make a payment.');
      return;
    }

    // Validate card details before submitting
    if (!cardNumber.trim() || !/^\d{13,16}$/.test(cardNumber.replace(/\s/g, ''))) {
      setError('Please enter a valid card number (13-16 digits)');
      return;
    }
    if (!expDate.trim() || !/^\d{2}\/\d{2}$/.test(expDate)) {
      setError('Please enter a valid expiry date (MM/YY)');
      return;
    }
    if (!cvc.trim() || !/^\d{3,4}$/.test(cvc)) {
      setError('Please enter a valid CVV (3-4 digits)');
      return;
    }
    if (!zip.trim() || !/^\d{5}$/.test(zip)) {
      setError('Please enter a valid ZIP code (5 digits)');
      return;
    }

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      // Use Stripe.js to tokenize card details securely
      const { token, error: tokenError } = await stripe.createToken({
        number: cardNumber.replace(/\s/g, ''), // Remove spaces from card number
        exp_month: parseInt(expDate.split('/')[0]), // Extract month from MM/YY
        exp_year: parseInt(expDate.split('/')[1]), // Extract year from MM/YY
        cvc: cvc,
        address_zip: zip, // ZIP code for billing
        address_country: country, // Country for billing
      });

      if (tokenError) throw new Error(tokenError.message);

      if (!paymentIntent || !paymentIntent.clientSecret) {
        throw new Error('Payment intent not available. Please try again.');
      }

      // Confirm payment with the token
      const paymentResponse = await confirmPayment(finalToken, {
        paymentIntentId: paymentIntent.client_secret, // Use client_secret instead of clientSecret for consistency
        paymentTokenId: token.id, // Use the token ID from Stripe
      });
      if (paymentResponse.message === 'Payment confirmed') {
        onContinue(); // Complete signup, close modal
      }
    } catch (err) {
      setError(err.message || 'Payment submission failed');
      console.error('Payment submission error:', err); // Log error for debugging
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
        
        <h2 className="text-2xl font-semibold text-[#0B0757] mb-4">Credit Card</h2>
        
        <p className="text-center text-gray-600 mb-8">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-gray-700 text-sm">Card Number</label>
            <input 
              type="text" 
              placeholder="Card Number" 
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-gray-700 text-sm">Exp. Date</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="MM/YY" 
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-1/2 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]"
                />
                <input 
                  type="text" 
                  placeholder="CVV" 
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  className="w-1/2 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]"
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-gray-700 text-sm">Country</label>
            <select 
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]"
            >
              <option value="US">United States (US)</option>
              <option value="CA">Canada (CA)</option>
              <option value="GB">United Kingdom (GB)</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-gray-700 text-sm">ZIP</label>
            <input 
              type="text" 
              placeholder="ZIP" 
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <div className="flex justify-between gap-4 mt-4">
            <button
              onClick={onClose}
              className="w-full py-3 bg-white text-[#0B0757] rounded-full border border-[#0B0757] font-medium text-base hover:bg-gray-100"
            >
              Back
            </button>
            <button
              type="submit"
              className="w-full py-3 bg-[#0B0757] text-white rounded-full font-medium text-base hover:bg-[#1a237e]"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreditCardForm;