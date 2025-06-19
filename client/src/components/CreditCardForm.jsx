import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  createPaymentIntent,
  confirmPayment,
  sendSubscriptionEmail,
  validatePromoCode,
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// eslint-disable-next-line react/prop-types
const CreditCardForm = ({
  onClose,
  onContinue,
  userId: propUserId,
  token: propToken,
}) => {
  const [error, setError] = useState('');
  const [cardError, setCardError] = useState('');
  const [promoError, setPromoError] = useState(''); 
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [country, setCountry] = useState('US');
  const [zipCode, setZipCode] = useState('90210');
  const cardElementRef = useRef(null);
  const cardInstanceRef = useRef(null);
  const stripeInstanceRef = useRef(null);
  const { token: contextToken, user } = useAuth();
  const finalToken = propToken || contextToken;
  const finalUserId = propUserId || user?.id;
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  const hasFetchedPaymentIntent = useRef(false);

  const BASE_AMOUNT = 119.88; // Original amount before discount in dollars
  const discountedAmount = BASE_AMOUNT * (1 - discount / 100);
  const discountAmount = BASE_AMOUNT * (discount / 100);

  // Reset card element to clear errors and make it editable again
  const resetCardElement = () => {
    if (cardInstanceRef.current) {
      cardInstanceRef.current.destroy();
      cardInstanceRef.current = null;
    }
    initializeCardElement();
  };

  const initializeCardElement = async () => {
    if (!stripeInstanceRef.current || !cardElementRef.current) return;

    const elements = stripeInstanceRef.current.elements();
    const card = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
          '::placeholder': { color: '#aab7c4' },
        },
        invalid: { color: '#fa755a', iconColor: '#fa755a' },
      },
      hidePostalCode: true,
    });

    card.mount(cardElementRef.current);
    cardInstanceRef.current = card;

    card.on('change', (event) => {
      if (event.error) {
        setCardError(event.error.message);
      } else {
        setCardError('');
      }
      // Clear general error when user starts typing
      if (error && event.complete === false) {
        setError('');
      }
    });

    card.on('focus', () => {
      setCardError(''); // Clear card errors when user focuses
    });
  };

  const fetchPaymentIntent = async (amount = BASE_AMOUNT) => {
    if (!finalToken) {
      setError('Please log in to make a payment.');
      return;
    }

    if (!finalUserId) {
      setError('User ID not found. Please log in again.');
      return;
    }

    const paymentData = {
      amount: Math.round(amount * 100),
      userId: finalUserId,
      doctorId: null,
    }; // Convert to cents
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
        setError(
          err.message ||
            'Invalid payment request. Please check your details and try again.'
        );
        return;
      }

      if (retryCount < maxRetries) {
        console.log(
          `Retrying fetchPaymentIntent (attempt ${
            retryCount + 1
          }/${maxRetries})...`
        );
        setRetryCount(retryCount + 1);
        setTimeout(() => fetchPaymentIntent(amount), 1000 * (retryCount + 1));
      } else {
        setError(
          err.message ||
            'Failed to create payment intent after multiple attempts.'
        );
      }
    }
  };

  const handlePromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    // Clear previous promo error
    setPromoError('');
    setIsLoading(true);

    try {
      console.log(
        'Sending promo code validation request with code:',
        promoCode
      );
      const response = await validatePromoCode(finalToken, promoCode.trim());
      console.log('Promo code validation response:', response);
      setDiscount(response.discountPercentage || 0);
      fetchPaymentIntent(
        BASE_AMOUNT * (1 - (response.discountPercentage || 0) / 100)
      ); // Re-fetch with discounted amount
      toast.success('Promo code applied successfully!');
    } catch (err) {
      console.error(
        'Validate promo code error:',
        err.response?.data || err.message
      );
      setDiscount(0);
      // Use separate promo error state instead of general error
      setPromoError(
        err.response?.data?.message || 'Invalid or expired promo code'
      );
      toast.error(
        err.response?.data?.message || 'Invalid or expired promo code'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Clear promo error when user types in promo code input
  const handlePromoCodeChange = (e) => {
    setPromoCode(e.target.value);
    if (promoError) {
      setPromoError('');
    }
  };

  useEffect(() => {
    if (hasFetchedPaymentIntent.current) return;
    hasFetchedPaymentIntent.current = true;

    const initializeStripeElements = async () => {
      setIsLoading(true);
      const stripe = await stripePromise;
      if (!stripe || !cardElementRef.current) {
        setError(
          'Stripe initialization failed. Please ensure the Stripe publishable key is set in the environment variables.'
        );
        setIsLoading(false);
        return;
      }

      stripeInstanceRef.current = stripe;
      await initializeCardElement();
      setIsLoading(false);
    };

    fetchPaymentIntent(BASE_AMOUNT); // Initial fetch with base amount
    initializeStripeElements();

    return () => {
      if (cardInstanceRef.current) {
        cardInstanceRef.current.destroy();
        cardInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalUserId, finalToken]); // Removed discount from dependencies to prevent re-fetch loop

  const handleCreditCard = async () => {
    // Clear all errors at start
    setError('');
    setCardError('');

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

      const { paymentMethod, error: paymentMethodError } =
        await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            address: { country: country, postal_code: zipCode },
          },
        });

      if (paymentMethodError) {
        setCardError(paymentMethodError.message);
        // Reset card element to make it editable again
        setTimeout(() => resetCardElement(), 100);
        return;
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
          const emailResponse = await sendSubscriptionEmail(
            finalToken,
            finalUserId
          );
          console.log('Subscription email sent successfully:', emailResponse);
        } catch (emailError) {
          console.error(
            'Failed to send subscription email:',
            emailError.message
          );
          toast.error(
            'Payment successful, but failed to send confirmation email. Please contact support.',
            {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
        }

        toast.success(
          'Welcome to Elite Healthspan! Your Annual Membership is Active 🎉',
          {
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
          }
        );
        onContinue();
      } else if (paymentResponse.requiresAction) {
        const { error: confirmError } = await stripe.confirmCardPayment(
          paymentIntent.clientSecret,
          {
            payment_method: paymentMethod.id,
          }
        );

        if (confirmError) {
          setCardError(confirmError.message);
          setTimeout(() => resetCardElement(), 100);
          return;
        }

        const secondConfirmation = await confirmPayment(finalToken, {
          paymentIntentId: paymentIntent.clientSecret.split('_secret_')[0],
          paymentMethodId: paymentMethod.id,
        });

        if (secondConfirmation.message === 'Payment confirmed') {
          console.log('Payment confirmed after 3D Secure:', secondConfirmation);

          try {
            const emailResponse = await sendSubscriptionEmail(
              finalToken,
              finalUserId
            );
            console.log('Subscription email sent successfully:', emailResponse);
          } catch (emailError) {
            console.error(
              'Failed to send subscription email:',
              emailError.message
            );
            toast.error(
              'Payment successful, but failed to send confirmation email. Please contact support.',
              {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              }
            );
          }

          toast.success(
            'Welcome to Elite Healthspan! Your Annual Membership is Active 🎉',
            {
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
            }
          );
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
      // Reset card element to make it editable again after error
      setTimeout(() => resetCardElement(), 100);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{ fontFamily: 'Karla' }}
      className='fixed inset-0 backdrop-blur-md bg-opacity-0 flex items-center justify-center z-50'
    >
      <div className='bg-white p-8 rounded-3xl shadow-lg relative max-w-md w-full mx-4'>
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer'
        >
          <X className='w-6 h-6' />
        </button>

        <h2
          style={{ fontFamily: 'Montserrat' }}
          className='text-2xl font-semibold text-[#0B0757] mb-4'
        >
          Credit Card Payment
        </h2>

        <div className='mb-4'>
          <input
            type='text'
            value={promoCode}
            onChange={handlePromoCodeChange}
            placeholder='Enter Promo Code'
            className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]'
            disabled={isLoading}
          />
          <button
            onClick={handlePromoCode}
            disabled={isLoading || !promoCode.trim()}
            className='mt-2 px-4 py-2 bg-[#0B0757] text-white rounded-lg hover:bg-[#1a237e] cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Applying...' : 'Apply'}
          </button>
          {/* Separate promo error display */}
          {promoError && (
            <p className='text-red-500 text-sm mt-2'>{promoError}</p>
          )}
        </div>

        {/* Payment Breakdown */}
        <div className='mb-4 p-4 bg-gray-100 rounded-lg'>
          <p className='text-gray-700'>
            <strong>Original Amount:</strong> ${BASE_AMOUNT.toFixed(2)}
          </p>
          {discount > 0 && (
            <>
              <p className='text-green-600'>
                <strong>Discount ({discount}%):</strong> -$
                {discountAmount.toFixed(2)}
              </p>
              <p className='text-gray-700'>
                <strong>Final Amount:</strong> ${discountedAmount.toFixed(2)}
              </p>
            </>
          )}
          <p className='text-gray-600 mt-2'>
            You are paying ${discountedAmount.toFixed(2)} for your annual
            membership.
          </p>
        </div>

        {/* Card Element */}
        <div className='mb-4'>
          <label className='text-gray-700 text-sm block mb-2'>
            Card Information
          </label>
          <div
            ref={cardElementRef}
            className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757] min-h-[44px]'
          >
            {error && error.includes('Stripe initialization failed') && (
              <p className='text-red-500 text-sm'>
                Error: Stripe not initialized. Check environment variables on
                deployment.
              </p>
            )}
          </div>
          {cardError && (
            <div className='mt-1'>
              <p className='text-red-500 text-sm'>{cardError}</p>
              <button
                onClick={resetCardElement}
                className='text-[#0B0757] text-sm hover:underline cursor-pointer'
              >
                Clear and try again
              </button>
            </div>
          )}
        </div>

        <div className='flex flex-col gap-2 mt-4'>
          <label className='text-gray-700 text-sm'>Country</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757] cursor-pointer'
            disabled={isLoading}
          >
            <option value='US'>United States (US)</option>
            <option value='CA'>Canada (CA)</option>
            <option value='GB'>United Kingdom (GB)</option>
          </select>
        </div>
        <div className='flex flex-col gap-2 mt-4'>
          <label className='text-gray-700 text-sm'>ZIP</label>
          <input
            type='text'
            placeholder='ZIP'
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0B0757]'
            disabled={isLoading}
          />
        </div>

        {/* General errors (excluding Stripe init and promo errors) */}
        {error && !error.includes('Stripe initialization failed') && (
          <p className='text-red-500 text-sm mt-4'>{error}</p>
        )}

        <div className='flex justify-between gap-4 mt-4'>
          <button
            onClick={onClose}
            className='w-full py-3 bg-white text-[#0B0757] rounded-full border border-[#0B0757] font-medium text-base hover:bg-gray-100 cursor-pointer'
            disabled={isLoading}
          >
            Back
          </button>
          <button
            onClick={handleCreditCard}
            disabled={isLoading || !cardInstanceRef.current}
            className='w-full py-3 bg-[#0C1F6D] text-white rounded-full font-medium text-base hover:bg-[#1a237e] disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer'
          >
            {isLoading ? 'Processing...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditCardForm;
