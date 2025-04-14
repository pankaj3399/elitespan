// client/src/components/ApplePayForm.jsx

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentIntent, confirmPayment } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// eslint-disable-next-line react/prop-types
const ApplePayForm = ({ onClose, onContinue, userId, token: propToken }) => {
  const [error, setError] = useState('');
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [applePayAvailable, setApplePayAvailable] = useState(false);
  const { token: contextToken } = useAuth();
  const finalToken = propToken || contextToken;

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      if (!finalToken) {
        setError('Please log in to make a payment.');
        return;
      }

      try {
        const response = await createPaymentIntent(finalToken, { amount: 9.99, userId, doctorId: null });
        setPaymentIntent(response);
      } catch (err) {
        setError(err.message || 'Failed to create payment intent.');
        console.error('Payment intent error:', err);
      }
    };

    const checkApplePay = async () => {
      const stripe = await stripePromise;
      if (!stripe) {
        setError('Stripe initialization failed.');
        return;
      }

      const paymentRequest = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: 'Elite Healthspan Membership',
          amount: 999, // Amount in cents (9.99 USD)
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      const result = await paymentRequest.canMakePayment();
      setApplePayAvailable(!!result && !!result.applePay);
      if (!result || !result.applePay) {
        setError('Apple Pay is not available on this device or browser. Please try on Safari with Apple Pay enabled.');
      }
    };

    fetchPaymentIntent();
    if (typeof window !== 'undefined' && window.ApplePaySession) {
      checkApplePay();
    }
  }, [userId, finalToken]);

  const handleApplePay = async () => {
    if (!finalToken) {
      setError('Please log in to make a payment.');
      return;
    }

    if (!applePayAvailable) {
      setError('Apple Pay is not available.');
      return;
    }

    if (!paymentIntent || !paymentIntent.clientSecret) {
      setError('Payment intent not available. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      const stripe = await stripePromise;
      const paymentRequest = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: 'Elite Healthspan Membership',
          amount: 999, // Amount in cents (9.99 USD)
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      paymentRequest.on('paymentmethod', async (event) => {
        try {
          const { error: confirmError } = await stripe.confirmApplePayPayment(paymentIntent.clientSecret, {
            paymentMethod: event.paymentMethod,
          });

          if (confirmError) {
            event.complete('fail');
            throw new Error(confirmError.message);
          }

          event.complete('success');

          const paymentIntentId = paymentIntent.clientSecret.split('_secret_')[0];
          const confirmResponse = await confirmPayment(finalToken, {
            paymentIntentId,
            paymentMethodId: event.paymentMethod.id,
          });

          if (confirmResponse.message === 'Payment confirmed') {
            onContinue();
          } else {
            setError('Apple Pay payment confirmation failed.');
          }
        } catch (err) {
          event.complete('fail');
          setError(err.message || 'Apple Pay payment failed');
          console.error('Apple Pay error:', err);
        } finally {
          setIsLoading(false);
        }
      });

      await paymentRequest.show();
    } catch (err) {
      setError(err.message || 'Apple Pay payment failed');
      console.error('Apple Pay error:', err);
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
        
        <h2 className="text-2xl font-semibold text-[#0B0757] mb-4">Apple Pay</h2>
        
        <p className="text-center text-gray-600 mb-8">
          Use Apple Pay to complete your payment securely. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {!applePayAvailable && !error && (
          <p className="text-yellow-500 text-sm mb-4">
            Apple Pay is not available on this device or browser. Please try on Safari with Apple Pay enabled.
          </p>
        )}
        
        <div className="flex justify-between gap-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white text-[#0B0757] rounded-full border border-[#0B0757] font-medium text-base hover:bg-gray-100"
          >
            Back
          </button>
          <button
            onClick={handleApplePay}
            disabled={isLoading || !applePayAvailable}
            className="w-full py-3 bg-[#0B0757] text-white rounded-full font-medium text-base hover:bg-[#1a237e] disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplePayForm;