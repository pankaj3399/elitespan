import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentIntent, confirmPayment, sendSubscriptionEmail } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CreditCardForm = ({ onClose, onContinue, userId: propUserId, token: propToken }) => {
  const [error, setError] = useState('');
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const cardElementRef = useRef(null);
  const cardInstanceRef = useRef(null);
  const stripeInstanceRef = useRef(null);
  const { token: contextToken, user } = useAuth(); // Get user from auth context
  const finalToken = propToken || contextToken;
  const finalUserId = propUserId || user?.id; // Fallback to user.id from context
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  const hasFetchedPaymentIntent = useRef(false);

  console.log('CreditCardForm props and context:', {
    propUserId,
    userIdFromContext: user?.id,
    finalUserId,
    finalToken: finalToken?.substring(0, 10) + '...',
  });

  const fetchPaymentIntent = async () => {
    if (!finalToken) {
      setError('Please log in to make a payment.');
      return;
    }

    if (!finalUserId) {
      setError('User ID not found. Please log in again.');
      return;
    }

    const paymentData = { amount: 119.88, userId: finalUserId, doctorId: null };
    console.log('Fetching payment intent with payload:', paymentData);

    try {
      const response = await createPaymentIntent(finalToken, paymentData);
      console.log('Payment intent response:', response);
      setPaymentIntent(response);
      setError('');
      setRetryCount(0);
    } catch (err) {
      console.error('Payment intent fetch error:', err);
      const status = err.response?.status;
      if (status === 400 || status === 401 || status === 403) {
        setError(err.message || 'Invalid payment request. Please check your details and try again.');
        return;
      }

      if (retryCount < maxRetries) {
        console.log(`Retrying fetchPaymentIntent (attempt ${retryCount + 1}/${maxRetries})...`);
        setRetryCount(retryCount + 1);
        setTimeout(fetchPaymentIntent, 1000 * (retryCount + 1));
      } else {
        setError(err.message || 'Failed to create payment intent after multiple attempts.');
      }
    }
  };

  useEffect(() => {
    if (hasFetchedPaymentIntent.current) return;
    hasFetchedPaymentIntent.current = true;

    const initializeStripeElements = async () => {
      setIsLoading(true);
      const stripe = await stripePromise;
      if (!stripe || !cardElementRef.current) {
        setError('Stripe initialization failed. Please refresh.');
        setIsLoading(false);
        return;
      }

      stripeInstanceRef.current = stripe;
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

    fetchPaymentIntent();
    initializeStripeElements();

    return () => {
      if (cardInstanceRef.current) {
        cardInstanceRef.current.destroy();
        cardInstanceRef.current = null;
      }
    };
  }, [finalUserId, finalToken]);

  const handleCreditCard = async () => {
    if (!finalToken) {
      setError('Please log in to make a payment.');
      return;
    }

    if (!finalUserId) {
      setError('User ID not found. Please log in again.');
      return;
    }

    if (!cardInstanceRef.current || !stripeInstanceRef.current) {
      setError('Payment elements not ready. Please wait.');
      return;
    }

    if (!paymentIntent || !paymentIntent.clientSecret) {
      setError('Payment intent not available. Retrying...');
      fetchPaymentIntent();
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

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      console.log('Payment intent before confirmation:', paymentIntent);
      if (!paymentIntent.clientSecret) {
        throw new Error('Payment intent not available. Please try again.');
      }

      const paymentResponse = await confirmPayment(finalToken, {
        paymentIntentId: paymentIntent.clientSecret.split('_secret_')[0],
        paymentMethodId: paymentMethod.id,
      });

      if (paymentResponse.message === 'Payment confirmed') {
        console.log('Payment confirmed successfully:', paymentResponse);

        // Send subscription confirmation email
        console.log('Attempting to send subscription email with:', { userId: finalUserId, token: finalToken?.substring(0, 10) + '...' });
        try {
          const emailResponse = await sendSubscriptionEmail(finalToken, finalUserId);
          console.log('Subscription email sent successfully:', emailResponse);
        } catch (emailError) {
          console.error('Failed to send subscription email:', emailError.message);
          toast.error('Payment successful, but failed to send confirmation email. Please contact support.', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }

        toast.success('Welcome to Elite Healthspan! Your Annual Membership is Active 🎉', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            background: '#0B0757',
            color: '#FFFFFF',
            fontSize: '16px',
            borderRadius: '8px',
            padding: '10px 20px',
          },
          icon: '🎉',
        });
        onContinue();
      } else if (paymentResponse.requiresAction) {
        const { error: confirmError } = await stripe.confirmCardPayment(paymentIntent.clientSecret, {
          payment_method: paymentMethod.id,
        });

        if (confirmError) {
          throw new Error(confirmError.message);
        }

        const secondConfirmation = await confirmPayment(finalToken, {
          paymentIntentId: paymentIntent.clientSecret.split('_secret_')[0],
          paymentMethodId: paymentMethod.id,
        });

        if (secondConfirmation.message === 'Payment confirmed') {
          console.log('Payment confirmed after 3D Secure:', secondConfirmation);

          // Send subscription confirmation email
          console.log('Attempting to send subscription email with:', { userId: finalUserId, token: finalToken?.substring(0, 10) + '...' });
          try {
            const emailResponse = await sendSubscriptionEmail(finalToken, finalUserId);
            console.log('Subscription email sent successfully:', emailResponse);
          } catch (emailError) {
            console.error('Failed to send subscription email:', emailError.message);
            toast.error('Payment successful, but failed to send confirmation email. Please contact support.', {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }

          toast.success('Welcome to Elite Healthspan! Your Annual Membership is Active 🎉', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            style: {
              background: '#0B0757',
              color: '#FFFFFF',
              fontSize: '16px',
              borderRadius: '8px',
              padding: '10px 20px',
            },
            icon: '🎉',
          });
          onContinue();
        } else {
          throw new Error('Payment failed after authentication.');
        }
      } else {
        throw new Error('Payment failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Payment submission failed');
      console.error('Payment submission error:', err);
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
        
        <h2 className="text-2xl font-semibold text-[#0B0757] mb-4">Credit Card Payment</h2>
        
        <p className="text-center text-gray-600 mb-8">
          Enter your credit card details to complete your annual membership payment of $119.88 securely.
        </p>

        <div ref={cardElementRef} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]" />
        <div className="flex flex-col gap-2 mt-4">
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
        <div className="flex flex-col gap-2 mt-4">
          <label className="text-gray-700 text-sm">ZIP</label>
          <input 
            type="text" 
            placeholder="ZIP" 
            defaultValue="90210"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]"
          />
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        <div className="flex justify-between gap-4 mt-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white text-[#0B0757] rounded-full border border-[#0B0757] font-medium text-base hover:bg-gray-100"
          >
            Back
          </button>
          <button
            onClick={handleCreditCard}
            disabled={isLoading}
            className="w-full py-3 bg-[#0B0757] text-white rounded-full font-medium text-base hover:bg-[#1a237e] disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditCardForm;