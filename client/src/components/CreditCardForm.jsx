import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentIntent, confirmPayment, sendSubscriptionEmail, validatePromoCode } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CreditCardForm = ({ onClose, onContinue, userId: propUserId, token: propToken }) => {
  const [error, setError] = useState('');
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const cardElementRef = useRef(null);
  const cardInstanceRef = useRef(null);
  const stripeInstanceRef = useRef(null);
  const { token: contextToken, user } = useAuth();
  const finalToken = propToken || contextToken;
  const finalUserId = propUserId || user?.id;
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  const hasFetchedPaymentIntent = useRef(false);

  const BASE_AMOUNT = 119.88; // Original amount before discount
  const discountedAmount = BASE_AMOUNT * (1 - discount / 100);
  const discountAmount = BASE_AMOUNT * (discount / 100);

  const fetchPaymentIntent = async (amount = BASE_AMOUNT) => {
    if (!finalToken) {
      setError('Please log in to make a payment.');
      return;
    }

    if (!finalUserId) {
      setError('User ID not found. Please log in again.');
      return;
    }

    const paymentData = { amount: amount * (1 - discount / 100), userId: finalUserId, doctorId: null };
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
        setTimeout(() => fetchPaymentIntent(amount), 1000 * (retryCount + 1));
      } else {
        setError(err.message || 'Failed to create payment intent after multiple attempts.');
      }
    }
  };

  const handlePromoCode = async () => {
    if (!promoCode) return;
    try {
      console.log('Sending promo code validation request:', { code: promoCode });
      const response = await validatePromoCode(finalToken, { code: promoCode }); // Ensure correct payload
      console.log('Promo code validation response:', response);
      setDiscount(response.discountPercentage);
      fetchPaymentIntent(BASE_AMOUNT); // Re-fetch with discounted amount
      toast.success('Promo code applied successfully!');
    } catch (err) {
      console.error('Validate promo code error:', err.response?.data || err.message);
      setDiscount(0);
      setError(err.response?.data?.message || 'Invalid or expired promo code');
      toast.error(err.response?.data?.message || 'Invalid or expired promo code');
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

    fetchPaymentIntent(BASE_AMOUNT * (1 - discount / 100));
    initializeStripeElements();

    return () => {
      if (cardInstanceRef.current) {
        cardInstanceRef.current.destroy();
        cardInstanceRef.current = null;
      }
    };
  }, [finalUserId, finalToken, discount]);

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
      fetchPaymentIntent(BASE_AMOUNT * (1 - discount / 100));
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
        
        <div className="mb-4">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Enter Promo Code"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]"
          />
          <button
            onClick={handlePromoCode}
            className="mt-2 px-4 py-2 bg-[#0B0757] text-white rounded-lg hover:bg-[#1a237e]"
          >
            Apply
          </button>
        </div>

        {/* Payment Breakdown */}
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-gray-700">
            <strong>Original Amount:</strong> ${BASE_AMOUNT.toFixed(2)}
          </p>
          {discount > 0 && (
            <>
              <p className="text-green-600">
                <strong>Discount ({discount}%):</strong> -${discountAmount.toFixed(2)}
              </p>
              <p className="text-gray-700">
                <strong>Final Amount:</strong> ${discountedAmount.toFixed(2)}
              </p>
            </>
          )}
          <p className="text-gray-600 mt-2">
            You are paying ${discountedAmount.toFixed(2)} for your annual membership.
          </p>
        </div>

        {/* Card Element */}
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