import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  ThumbsUp,
  MapPin,
  Bookmark,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllProviders } from '../../services/api';
import PaymentMethodModal from '../../components/PaymentMethodModal';
import CreditCardForm from '../../components/CreditCardForm';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// --- REUSABLE COMPONENTS with Enhanced Hover Effects ---

const ProviderCard = ({ provider }) => (
  <div className='group w-[300px] sm:w-[380px] flex-shrink-0 bg-white rounded-2xl border border-gray-200/80 shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1'>
    <div className='h-48 overflow-hidden'>
      {provider.headshotUrl ? (
        <img
          src={provider.headshotUrl}
          alt={provider.providerName}
          className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
        />
      ) : (
        <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
          <div
            className='w-full h-full bg-transparent'
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d1d5db' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          ></div>
        </div>
      )}
    </div>
    <div className='p-5'>
      <div className='flex justify-between items-start mb-2'>
        <p className='text-sm text-gray-500'>
          [{provider.specialties?.[0] || 'Healthcare'}]
        </p>
        {provider.distance && (
          <div className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium'>
            {provider.distance} mi
          </div>
        )}
      </div>
      <h3 className='text-xl font-semibold text-gray-800 mt-1'>
        {provider.providerName}
      </h3>
      <div className='mt-3 bg-gray-100/70 rounded-lg p-2 flex flex-wrap justify-around items-center text-sm gap-2'>
        {provider.reviewStats && (
          <>
            <span className='flex items-center gap-1 text-gray-600'>
              <Star size={16} className='text-yellow-400' /> Reviews{' '}
              {provider.reviewStats.averageSatisfactionRating.toFixed(1)} (
              {provider.reviewStats.totalReviews})
            </span>
            <span className='flex items-center gap-1 text-gray-600'>
              <ThumbsUp size={16} className='text-blue-400' /> Efficacy{' '}
              {provider.reviewStats.averageEfficacyRating.toFixed(1)}
            </span>
          </>
        )}
        <span className='flex items-center gap-1 text-gray-600'>
          <MapPin size={16} className='text-green-400' /> {provider.city},{' '}
          {provider.state}
        </span>
      </div>
      <div className='mt-4'>
        <p className='font-semibold text-gray-700 text-sm'>Specialties</p>
        <p className='text-gray-600 text-sm truncate'>
          {provider.specialties?.join(', ') || 'Not specified'}
        </p>
      </div>
      <div className='mt-5 flex gap-3'>
        <button className='flex-1 py-2.5 px-4 rounded-full border border-gray-300 text-gray-800 font-semibold transition-all duration-200 hover:bg-gray-100 hover:border-gray-400 cursor-pointer'>
          See Profile
        </button>
        <button className='flex-1 py-2.5 px-4 rounded-full bg-[#0B247D] text-white font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:bg-[#081b5a] hover:shadow-lg cursor-pointer'>
          <Bookmark size={16} /> Save
        </button>
      </div>
    </div>
  </div>
);

const HorizontalProvidersSection = ({ title, items, isLoading, error }) => {
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className='w-full flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900'></div>
        </div>
      );
    }
    if (error) {
      return (
        <div className='w-full flex justify-center items-center h-64'>
          <p className='text-red-500 text-center'>{error}</p>
        </div>
      );
    }
    if (items.length === 0) {
      return (
        <div className='w-full flex justify-center items-center h-64'>
          <p className='text-gray-500'>No providers found.</p>
        </div>
      );
    }
    return (
      <div className='relative'>
        {/* Navigation Arrows */}
        <button
          onClick={scrollLeft}
          className='hidden md:block absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors border border-gray-200'
        >
          <ChevronLeft size={20} className='text-gray-600' />
        </button>
        <button
          onClick={scrollRight}
          className='hidden md:block absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors border border-gray-200'
        >
          <ChevronRight size={20} className='text-gray-600' />
        </button>

        {/* Horizontal scroll container */}
        <div
          ref={scrollContainerRef}
          className='flex overflow-x-auto gap-6 px-4 sm:px-6 md:px-8 py-4'
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {items.map((item) => (
            <ProviderCard key={item._id} provider={item} />
          ))}
          <div className='flex-shrink-0 w-1 sm:w-2 md:w-4'></div>
        </div>
      </div>
    );
  };

  return (
    <div className='w-full max-w-7xl mx-auto py-8'>
      <div className='flex justify-between items-center mb-6 px-4 sm:px-6 md:px-8'>
        <h2 className='text-2xl sm:text-3xl font-semibold text-gray-800'>
          {title}
        </h2>
        {items.length > 0 && !isLoading && (
          // Arrows in the header are also hidden on mobile
          <div className='hidden md:flex gap-2'>
            <button
              onClick={scrollLeft}
              className='p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors'
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollRight}
              className='p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors'
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
      {renderContent()}
    </div>
  );
};

// --- USER STORY SECTION ---
const UserStorySection = () => (
  <div className='w-full max-w-7xl mx-auto py-16 px-4'>
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-center'>
      <div className='relative'>
        <img
          src='https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=800'
          alt='Patient testimonial'
          className='w-full h-[500px] object-cover rounded-2xl shadow-lg'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl'></div>
      </div>
      <div className='space-y-6'>
        <div className='inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium'>
          Member Highlight
        </div>
        <h2 className='text-3xl font-bold text-gray-900 leading-tight'>
          "Finding the right specialist changed everything for my health journey"
        </h2>
        <div className='text-gray-600 text-lg leading-relaxed space-y-4'>
          <p>
            "I had been struggling with chronic fatigue for months and couldn't
            find answers. Through Elite Healthspan, I connected with Dr. Sarah
            Mitchell, who specialized in hormonal health. Her comprehensive
            approach and personalized treatment plan made all the difference."
          </p>
          <p>
            "Within just 3 months, I had my energy back and felt like myself
            again. The platform made it so easy to find exactly the right
            provider for my specific needs."
          </p>
        </div>
        <div className='flex items-center gap-4'>
          <div className='w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold'>
            JM
          </div>
          <div>
            <p className='font-semibold text-gray-900'>Jessica Martinez</p>
            <p className='text-gray-500 text-sm'>
              Elite Healthspan Member since 2023
            </p>
          </div>
        </div>
        <button className='bg-[#0B247D] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#081b5a] transition-colors'>
          Read More Success Stories
        </button>
      </div>
    </div>
  </div>
);

// --- MAIN DASHBOARD COMPONENT ---
function Dashboard() {
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showCreditCardForm, setShowCreditCardForm] = useState(false);

  const [nearbyProviders, setNearbyProviders] = useState([]);
  const [isNearbyLoading, setIsNearbyLoading] = useState(true);
  const [nearbyError, setNearbyError] = useState(null);

  const [interestProviders, setInterestProviders] = useState([]);
  const [isInterestLoading, setIsInterestLoading] = useState(true);
  const [interestError, setInterestError] = useState(null);

  const [searchFilters, setSearchFilters] = useState({
    specialty: '',
    location: '',
  });

  useEffect(() => {
    if (user && !user.isPremium) {
      setShowPaymentMethodModal(true);
    }
    if (user && user.isPremium && !user.contactInfo && refreshUser) {
      refreshUser().catch((error) =>
        console.error('Failed to refresh user profile:', error)
      );
    }
  }, [user, refreshUser]);

  const fetchNearbyProviders = useCallback(
    async (isSearch = false) => {
      if (!user?.id) return;
      setIsNearbyLoading(true);
      setNearbyError(null);
      try {
        const filters = { userId: user.id };
        if (isSearch) {
          if (searchFilters.location) filters.location = searchFilters.location;
          if (searchFilters.specialty)
            filters.specialty = searchFilters.specialty;
        }
        const response = await getAllProviders(filters);
        setNearbyProviders(response.providers || []);
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch nearby providers.';
        setNearbyError(errorMessage);
      } finally {
        setIsNearbyLoading(false);
      }
    },
    [user?.id, searchFilters.location, searchFilters.specialty]
  );

  const fetchInterestProviders = useCallback(async () => {
    const userSpecialties = user?.contactInfo?.specialties;
    if (!user?.id || !userSpecialties || userSpecialties.length === 0) {
      setIsInterestLoading(false);
      setInterestProviders([]);
      return;
    }
    setIsInterestLoading(true);
    setInterestError(null);
    try {
      const filters = {
        userId: user.id,
        userSpecialties: userSpecialties.join(','),
      };
      const response = await getAllProviders(filters);
      setInterestProviders(response.providers || []);
    } catch (err) {
      const errorMessage =
        err.message || 'Failed to fetch providers for your interests.';
      setInterestError(errorMessage);
    } finally {
      setIsInterestLoading(false);
    }
  }, [user?.id, user?.contactInfo?.specialties]);

  useEffect(() => {
    if (user?.isPremium && user.id) {
      fetchNearbyProviders();
      fetchInterestProviders();
    }
  }, [user?.isPremium, user?.id, fetchNearbyProviders, fetchInterestProviders]);

  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNearbyProviders(true);
  };

  const handlePaymentMethodSelect = (method) => {
    if (method === 'creditCard') {
      setShowPaymentMethodModal(false);
      setShowCreditCardForm(true);
    }
  };

  const handlePaymentSuccess = async () => {
    setShowCreditCardForm(false);
    try {
      const updatedUser = await refreshUser();
      if (updatedUser && updatedUser.isPremium) {
        toast.success(
          'Payment successful! Welcome to Elite Healthspan Premium! 🎉'
        );
      } else {
        toast.success(
          'Payment successful! Your premium access is being activated...'
        );
      }
    } catch (error) {
      console.error('Failed to refresh user data after payment:', error);
      toast.success(
        'Payment successful! Please refresh the page to see your premium access.'
      );
    }
  };

  const handleClosePaymentModals = () => {
    setShowPaymentMethodModal(false);
    setShowCreditCardForm(false);
  };

  if (
    !user ||
    (!user.isPremium && (showPaymentMethodModal || showCreditCardForm))
  ) {
    return (
      <>
        {showPaymentMethodModal && (
          <PaymentMethodModal
            onClose={handleClosePaymentModals}
            onContinue={handlePaymentMethodSelect}
            userId={user?.id}
          />
        )}
        {showCreditCardForm && (
          <CreditCardForm
            onClose={handleClosePaymentModals}
            onContinue={handlePaymentSuccess}
            userId={user?.id}
            token={token}
          />
        )}
      </>
    );
  }

  if (!user.isPremium && !showPaymentMethodModal && !showCreditCardForm) {
    return (
      <div className='flex items-center justify-center h-screen bg-gray-50'>
        <div className='text-center p-8'>
          <h1 className='text-2xl font-bold text-gray-800'>
            Premium Access Required
          </h1>
          <p className='text-gray-600 mt-2'>
            Please complete your subscription to view the dashboard.
          </p>
          <button
            onClick={() => setShowPaymentMethodModal(true)}
            className='mt-6 px-6 py-2 bg-[#0B247D] text-white font-semibold rounded-full hover:bg-[#091c62] cursor-pointer'
          >
            Subscribe Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-[#F9F9F9] min-h-screen'>
      {/* Hero Section */}
      <div className='relative h-[60vh] min-h-[500px] text-white flex flex-col'>
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat'
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/9843594/pexels-photo-9843594.jpeg')",
            filter: 'brightness(0.7)',
          }}
        ></div>
        <div className='relative z-10 flex-grow flex flex-col items-center justify-center text-center px-4'>
          <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold mb-2'>
            Good Afternoon {user.name?.split(' ')[0]},
          </h1>
          <h2 className='text-xl sm:text-2xl md:text-3xl font-light mb-8'>
            What area are you interested in?
          </h2>
          <form
            onSubmit={handleSearchSubmit}
            className='w-full max-w-2xl bg-white rounded-full p-1.5 sm:p-2 flex items-center shadow-lg'
          >
            <div className='flex-1 flex items-center gap-2 pl-3 sm:pl-4'>
              <Search className='text-gray-400' />
              <input
                type='text'
                name='specialty'
                placeholder='Specialties'
                value={searchFilters.specialty}
                onChange={handleSearchInputChange}
                className='w-full bg-transparent outline-none text-gray-800 text-sm sm:text-base'
              />
            </div>
            <div className='h-8 w-px bg-gray-200 mx-2'></div>
            <div className='flex-1 flex items-center gap-2 pl-2'>
              <input
                type='text'
                name='location'
                placeholder='City, State'
                value={searchFilters.location}
                onChange={handleSearchInputChange}
                className='w-full bg-transparent outline-none text-gray-800 text-sm sm:text-base'
              />
            </div>
            <button
              type='submit'
              className='p-2.5 sm:p-3 bg-[#0B247D] rounded-full text-white transition-transform duration-200 hover:scale-110 cursor-pointer'
            >
              <ArrowRight />
            </button>
          </form>
        </div>
      </div>

      {/* Content Section */}
      <main>
        <HorizontalProvidersSection
          title='Providers Near You'
          items={nearbyProviders}
          isLoading={isNearbyLoading}
          error={nearbyError}
        />

        {user?.contactInfo?.specialties?.length > 0 && (
          <HorizontalProvidersSection
            title='Areas of Interest'
            items={interestProviders}
            isLoading={isInterestLoading}
            error={interestError}
          />
        )}

        <UserStorySection />
      </main>

      <footer className='text-center p-8 text-gray-500 text-sm'>
        © {new Date().getFullYear()} Elite Healthspan. All rights reserved.
      </footer>
    </div>
  );
}

export default Dashboard;
