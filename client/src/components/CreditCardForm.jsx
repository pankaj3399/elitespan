// client/src/components/CreditCardForm.jsx

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentIntent, confirmPayment } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CreditCardForm = ({ onClose, onContinue, userId, token: propToken }) => {
  const [error, setError] = useState('');
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const cardElementRef = useRef(null);
  const cardInstanceRef = useRef(null);
  const stripeInstanceRef = useRef(null); // Store the Stripe instance
  const { token: contextToken } = useAuth();
  const finalToken = propToken || contextToken;

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      if (!finalToken) {
        setError('Please log in to make a payment.');
        return;
      }

      try {
        console.log('Fetching payment intent with token:', finalToken);
        const response = await createPaymentIntent(finalToken, { amount: 9.99, userId, doctorId: null });
        console.log('Payment intent response:', response); // Debug response
        setPaymentIntent(response);
      } catch (err) {
        setError(err.message || 'Failed to create payment intent.');
        console.error('Payment intent error:', err);
      }
    };
    fetchPaymentIntent();
  }, [userId, finalToken]);

  useEffect(() => {
    const initializeStripeElements = async () => {
      setIsLoading(true);
      const stripe = await stripePromise;
      if (!stripe || !cardElementRef.current) {
        setError('Stripe initialization failed. Please refresh.');
        setIsLoading(false);
        return;
      }

      stripeInstanceRef.current = stripe; // Store the Stripe instance
      const elements = stripe.elements();
      const card = elements.create('card', {
        style: {
          base: { fontSize: '16px', color: '#32325d', '::placeholder': { color: '#aab7c4' } },
          invalid: { color: '#fa755a', iconColor: '#fa755a' },
        },
        hidePostalCode: true,
      });

      card.mount(cardElementRef.current);
      cardInstanceRef.current = card;

      card.on('change', (event) => {
        setError(event.error ? event.error.message : '');
      });

      setIsLoading(false);
    };

    initializeStripeElements();

    return () => {
      if (cardInstanceRef.current) {
        cardInstanceRef.current.destroy();
        cardInstanceRef.current = null;
      }
    };
  }, []);

const handleSubmit = async (event) => {
  event.preventDefault();

  if (!finalToken) {
    setError('Please log in to make a payment.');
    return;
  }

  if (!cardInstanceRef.current || !stripeInstanceRef.current) {
    setError('Payment elements not ready. Please wait.');
    return;
  }

  setIsLoading(true);
  try {
    const stripe = stripeInstanceRef.current;
    const cardElement = cardInstanceRef.current;
    console.log('Creating payment method with card element:', cardElement);

    const { paymentMethod, error: paymentMethodError } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: { address: { country: 'US', postal_code: '90210' } },
    });

    if (paymentMethodError) throw new Error(paymentMethodError.message);

    console.log('Payment intent before confirmation:', paymentIntent);
    if (!paymentIntent || !paymentIntent.clientSecret) {
      throw new Error('Payment intent not available. Please try again.');
    }

    // Extract the PaymentIntent ID from the clientSecret (split by '_secret_')
    const paymentIntentId = paymentIntent.clientSecret.split('_secret_')[0];
    console.log('Extracted PaymentIntent ID:', paymentIntentId);

    const paymentResponse = await confirmPayment(finalToken, {
      paymentIntentId: paymentIntentId, // Use the extracted ID
      paymentMethodId: paymentMethod.id,
    });

    if (paymentResponse.message === 'Payment confirmed') {
      onContinue();
    } else {
      setError('Payment failed. Please try again.');
    }
  } catch (err) {
    setError(err.message || 'Payment submission failed');
    console.error('Payment submission error:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      param: err.param,
    });
  } finally {
    setIsLoading(false);
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
          <div ref={cardElementRef} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]"></div>
          
          <div className="flex flex-col gap-2">
            <label className="text-gray-700 text-sm">Country</label>
            <select 
              defaultValue="US"
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
              defaultValue="90210"
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
              disabled={isLoading}
              className="w-full py-3 bg-[#0B0757] text-white rounded-full font-medium text-base hover:bg-[#1a237e] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreditCardForm;