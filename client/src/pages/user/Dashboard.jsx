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
import { useAuth } from '../../contexts/AuthContext';

// --- REUSABLE COMPONENTS with Enhanced Hover Effects ---

const ProviderCard = ({ provider }) => (
  <div className='group flex-shrink-0 w-[380px] bg-white rounded-2xl border border-gray-200/80 shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1'>
    <div className='h-48 flex overflow-hidden'>
      {provider.headshotUrl ? (
        <img
          src={provider.headshotUrl}
          alt={provider.providerName}
          className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
            provider.galleryUrl ? 'w-1/2' : 'w-full'
          }`}
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
      {provider.galleryUrl && (
        <img
          src={provider.galleryUrl}
          alt='Office'
          className='w-1/2 object-cover transition-transform duration-300 group-hover:scale-105'
        />
      )}
    </div>
    <div className='p-5'>
      <p className='text-sm text-gray-500'>
        [{provider.specialties?.[0] || 'Healthcare'}]
      </p>
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

const ProvidersSection = ({ title, items, isLoading, error }) => {
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
          <p className='text-gray-500'>No providers match your search.</p>
        </div>
      );
    }
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        {items.map((item) => (
          <ProviderCard key={item._id} provider={item} />
        ))}
      </div>
    );
  };

  return (
    <div className='w-full max-w-7xl mx-auto py-12 px-4 md:px-8'>
      <div className='flex justify-between items-center mb-8'>
        <h2 className='text-3xl font-semibold text-gray-800'>{title}</h2>
      </div>
      {renderContent()}
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---

function Dashboard() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchFilters, setSearchFilters] = useState({
    specialty: '',
    location: '',
  });

  useEffect(() => {
    if (user && !user.isPremium) {
      setShowModal(true);
    }
  }, [user]);

  const fetchProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters = {
        search: searchFilters.location,
        specialty: searchFilters.specialty,
      };
      const response = await getAllProviders(filters);
      setProviders(response.providers || []);
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch providers.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [searchFilters.location, searchFilters.specialty]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProviders();
  };

  // --- Render logic for non-premium users ---
  if (!user || (!user.isPremium && showModal)) {
    return (
      <PaymentMethodModal
        onClose={() => setShowModal(false)}
        onContinue={(method) => console.log('Continue with', method)}
      />
    );
  }
  if (!user.isPremium && !showModal) {
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
            onClick={() => setShowModal(true)}
            className='mt-6 px-6 py-2 bg-[#0B247D] text-white font-semibold rounded-full hover:bg-[#091c62] cursor-pointer'
          >
            Subscribe Now
          </button>
        </div>
      </div>
    );
  }

  // --- Render logic for premium users ---
  return (
    <div className='bg-[#F9F9F9] min-h-screen'>
      {/* Hero Section */}
      <div className='relative h-[60vh] min-h-[500px] text-white flex flex-col'>
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat'
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/9843594/pexels-photo-9843594.jpeg')",
            filter: 'brightness(0.8)',
          }}
        ></div>
        <div className='relative z-10 flex-grow flex flex-col items-center justify-center text-center px-4'>
          <h1 className='text-4xl md:text-5xl font-bold'>
            Find Your Ideal Provider
          </h1>
          <h2 className='text-2xl md:text-3xl mt-2 font-light'>
            Search by specialty, location, and more.
          </h2>
          <form
            onSubmit={handleSearchSubmit}
            className='mt-8 w-full max-w-2xl bg-white rounded-full p-2 flex items-center shadow-lg'
          >
            <div className='flex-1 flex items-center gap-2 pl-4'>
              <Search className='text-gray-400' />
              <input
                type='text'
                name='specialty'
                placeholder='Specialties'
                value={searchFilters.specialty}
                onChange={handleSearchInputChange}
                className='w-full bg-transparent outline-none text-gray-800'
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
                className='w-full bg-transparent outline-none text-gray-800'
              />
            </div>
            <button
              type='submit'
              className='p-3 bg-[#0B247D] rounded-full text-white transition-transform duration-200 hover:scale-110 cursor-pointer'
            >
              <ArrowRight />
            </button>
          </form>
        </div>
      </div>

      {/* Content Section */}
      <main>
        <ProvidersSection
          title='Search Results'
          items={providers}
          isLoading={isLoading}
          error={error}
        />
      </main>
      <footer className='text-center p-8 text-gray-500 text-sm'>
        © {new Date().getFullYear()} Elite Healthspan. All rights reserved.
      </footer>
    </div>
  );
}

export default Dashboard;
