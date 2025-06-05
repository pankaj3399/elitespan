import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProvider } from '../services/api';
import { CiMobile2 } from 'react-icons/ci';
import { FiSend } from 'react-icons/fi';
import { IoBookmarkOutline, IoClose } from 'react-icons/io5';
import { FaRegStar, FaRegThumbsUp, FaStar } from 'react-icons/fa';

function ProviderProfile() {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reviews state
  const [reviewsData, setReviewsData] = useState(null);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [allReviews, setAllReviews] = useState([]);
  const [galleryImageError, setGalleryImageError] = useState(false);

  // Get Google Maps API key from environment variables
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    fetchProviderData();
  }, [providerId]);

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      setError(null);
      setGalleryImageError(false);
      const data = await getProvider(providerId);
      const providerData = data.provider || data;
      setProvider(providerData);

      // Set initial reviews data from provider
      if (providerData && providerData.reviewStats) {
        // Added check for providerData
        setReviewsData({
          stats: providerData.reviewStats,
          reviews:
            providerData.reviews
              ?.filter((r) => r.isActive && r.isApproved)
              .slice(0, 3) || [],
        });
      } else {
        setReviewsData({
          stats: {
            totalReviews: 0,
            averageSatisfactionRating: 0,
            averageEfficacyRating: 0,
          },
          reviews: [],
        });
      }
    } catch (err) {
      console.error('Error fetching provider data:', err);
      setError('Failed to load provider information. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getProviderReviews = async (providerId, page = 1, limit = 10) => {
    const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';
    const response = await fetch(
      `${BASE_URL}/api/provider-info/${providerId}/reviews?page=${page}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    return response.json();
  };

  const fetchAllReviews = async () => {
    try {
      const data = await getProviderReviews(providerId, 1, 50);
      setAllReviews(data.reviews || []); // Ensure allReviews is an array
      setShowReviewsModal(true);
    } catch (err) {
      console.error('Error fetching all reviews:', err);
      alert('Failed to load reviews. Please try again.');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className='text-yellow-400' size={16} />);
    }
    if (hasHalfStar) {
      stars.push(
        <FaStar
          key='half'
          className='text-yellow-400'
          size={16}
          style={{ opacity: 0.5 }}
        />
      );
    }
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <FaRegStar key={`empty-${i}`} className='text-gray-300' size={16} />
      );
    }
    return stars;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper functions
  const getGoogleMapsEmbedUrl = () => {
    if (
      !provider ||
      !provider.address ||
      !provider.city ||
      !provider.state ||
      !provider.zip
    )
      return ''; // Defensive check
    const address = `${provider.address}, ${provider.city}, ${provider.state} ${provider.zip}`;
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodedAddress}&zoom=15&maptype=roadmap`;
  };

  const getGoogleMapsDirectionsUrl = () => {
    if (!provider) return '';
    const address =
      provider.fullAddress ||
      `${provider.address || ''}, ${provider.city || ''}, ${
        provider.state || ''
      } ${provider.zip || ''}`.replace(/,\s*$/, ''); // Ensure no trailing commas if parts are missing
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      address
    )}`;
  };

  const formatSpecialties = () => {
    if (
      !provider ||
      !provider.specialties || // Check if specialties array exists
      provider.specialties.length === 0
    ) {
      return 'Specialty information not available';
    }
    return provider.specialties.join(', ');
  };

  const getPrimarySpecialty = () => {
    if (provider && provider.specialties && provider.specialties.length > 0) {
      // Check if specialties array exists
      return provider.specialties[0];
    }
    return 'Healthcare Provider';
  };

  const getFormattedAddress = () => {
    if (!provider) return '';
    const parts = [];
    if (provider.address) parts.push(provider.address);
    if (provider.suite) parts.push(provider.suite);
    return parts.join(', ');
  };

  const getCityStateZip = () => {
    if (!provider) return '';
    return `${provider.city || ''}, ${provider.state || ''} ${
      provider.zip || ''
    }`.replace(/,\s*$/, ''); // Ensure no trailing commas
  };

  // Loading state
  if (loading) {
    return (
      <div className='min-h-screen flex flex-col bg-[#FCF8F4]'>
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#0C1F6D] mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading provider information...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='min-h-screen flex flex-col bg-[#FCF8F4]'>
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <div className='text-red-500 text-lg mb-4'>⚠️</div>
            <h2 className='text-xl font-semibold text-gray-800 mb-2'>
              Error Loading Profile
            </h2>
            <p className='text-gray-600 mb-4'>{error}</p>
            <button
              onClick={fetchProviderData}
              className='px-4 py-2 bg-[#0C1F6D] text-white rounded-lg hover:bg-[#0C1F6D]/90'
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No provider found
  if (!provider) {
    return (
      <div className='min-h-screen flex flex-col bg-[#FCF8F4]'>
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <h2 className='text-xl font-semibold text-gray-800 mb-2'>
              Provider Not Found
            </h2>
            <p className='text-gray-600'>
              The provider you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const stats = reviewsData?.stats || {
    totalReviews: 0,
    averageSatisfactionRating: 0,
    averageEfficacyRating: 0,
  };

  const headshotDisplayUrl =
    provider.headshotUrl ||
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=400&fit=crop&crop=face';
  const galleryDisplayUrl = provider.galleryUrl;

  return (
    <div className='min-h-screen flex flex-col bg-[#FCF8F4]'>
    {/* Header Section with Two Images Side by Side */}
<div className='relative w-full h-[75vh] bg-[#F5F5F5] flex flex-col md:flex-row'>
  {/* Left Image - Doctor Photo */}
  <div className='w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden'>
    <img
      src={headshotDisplayUrl}
      alt={`${provider.providerName || 'Provider'} - Profile`}
      className='w-full h-full object-cover object-top'
      onError={(e) => {
        e.target.onerror = null;
        e.target.src =
          'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=400&fit=crop&crop=center';
      }}
    />
  </div>

  {/* Right Side - Gallery Image */}
  <div className='w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden'>
    {galleryDisplayUrl && !galleryImageError ? (
      <img
        src={galleryDisplayUrl}
        alt='Office/Procedures by provider'
        className='w-full h-full object-cover object-center'
        onError={() => {
          console.warn(
            `Failed to load gallery image: ${galleryDisplayUrl}`
          );
          setGalleryImageError(true);
        }}
      />
    ) : (
      <div className='w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-500 text-sm text-center leading-relaxed'>
        Office Photo
        <br />
        [Not Available]
      </div>
    )}
    
    {/* All Photos Button - positioned on right side */}
    <button className='absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full text-sm font-medium shadow-lg border border-white/20 hover:bg-white hover:-translate-y-0.5 transition-all duration-200'>
      All Photos (0)
    </button>
  </div>
</div>

      {/* Reviews Modal */}
      {showReviewsModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden'>
            <div className='flex justify-between items-center p-6 border-b'>
              <h2 className='text-2xl font-semibold text-[#061140]'>
                Patient Reviews ({stats.totalReviews})
              </h2>
              <button
                onClick={() => setShowReviewsModal(false)}
                className='text-gray-500 hover:text-gray-700'
              >
                <IoClose size={24} />
              </button>
            </div>
            <div className='p-6 overflow-y-auto max-h-[calc(80vh-120px)]'>
              {allReviews.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  No reviews available yet.
                </div>
              ) : (
                <div className='space-y-6'>
                  {allReviews.map((review) => (
                    <div
                      key={review._id}
                      className='border-b border-gray-200 pb-6 last:border-b-0'
                    >
                      <div className='flex justify-between items-start mb-3'>
                        <div>
                          <h4 className='font-semibold text-[#061140] text-lg'>
                            {review.clientName}
                          </h4>
                          <div className='flex items-center gap-4 mt-1'>
                            <div className='flex items-center gap-1'>
                              <span className='text-sm text-gray-600'>
                                Satisfaction:
                              </span>
                              {renderStars(review.satisfactionRating)}
                              <span className='text-sm font-medium text-[#061140] ml-1'>
                                {review.satisfactionRating?.toFixed(1)}
                              </span>
                            </div>
                            <div className='flex items-center gap-1'>
                              <span className='text-sm text-gray-600'>
                                Efficacy:
                              </span>
                              {renderStars(review.efficacyRating)}
                              <span className='text-sm font-medium text-[#061140] ml-1'>
                                {review.efficacyRating?.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className='text-sm text-gray-500'>
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <p className='text-[#484848]/80 text-base leading-relaxed'>
                        {review.reviewText}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className='w-[95vw] mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-3 -mt-32 relative z-10'>
          {/* Left Card: Contact & Office - Combined */}
          <div className='lg:col-span-1'>
            <div className='bg-white border border-[#7E7E7E]/50 rounded-[20px] p-6'>
              {/* Provider Info Section */}
              <div className='mb-6'>
                <div className='text-base text-gray-400 mb-1 font-karla'>
                  [{getPrimarySpecialty()}]
                </div>
                <div className='text-2xl font-[500] font-montserrat leading-[28px] text-[#061140] mb-4'>
                  {provider.providerName || 'Provider Name'}
                </div>
                <div className='flex gap-2 mb-4'>
                  <button className='flex-1 font-karla py-3 px-2 bg-[#0C1F6D] text-white rounded-full font-medium text-base flex items-center justify-center gap-2'>
                    <CiMobile2 size={18} /> Call
                  </button>
                  <button
                    onClick={() =>
                      (window.location.href = `mailto:${provider.email || ''}`)
                    }
                    className='flex-1 font-karla py-3 px-2 bg-[#0C1F6D] text-white rounded-full font-medium text-base flex items-center justify-center gap-2'
                  >
                    <FiSend size={18} /> Email
                  </button>
                  <button className='flex-1 py-3 px-2 font-karla bg-[#0C1F6D] text-white rounded-full font-medium text-base flex items-center justify-center gap-2'>
                    <IoBookmarkOutline size={18} /> Save
                  </button>
                </div>
              </div>

              {/* Office Section */}
              <div className='mb-4'>
                <div className='font-semibold text-[#061140] mb-2 text-sm'>
                  Office
                </div>
                <div className='w-full h-40 bg-gray-200 rounded-xl mb-5 overflow-hidden'>
                  <iframe
                    src={getGoogleMapsEmbedUrl()}
                    width='100%'
                    height='100%'
                    style={{ border: 0, minHeight: '160px' }}
                    allowFullScreen={true}
                    loading='lazy'
                    referrerPolicy='no-referrer-when-downgrade'
                    title={`Map showing ${provider.practiceName || 'Practice'} location`}
                    sandbox='allow-scripts allow-same-origin allow-popups allow-forms'
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling)
                        e.target.nextSibling.style.display = 'flex';
                    }}
                  ></iframe>
                  <div
                    className='w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center'
                    style={{ display: 'none' }}
                  >
                    <div className='text-center text-gray-600'>
                      <div className='text-2xl mb-2'>📍</div>
                      <div className='text-sm font-medium'>Map View</div>
                      <div className='text-xs'>
                        {provider.city || 'City'}, {provider.state || 'State'}
                      </div>
                      <a
                        href={getGoogleMapsDirectionsUrl()}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-xs text-blue-600 underline mt-1 block'
                      >
                        View on Google Maps
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className='flex justify-between items-start mb-4'>
                  <div>
                    <div className='text-base text-[#333333] mb-1 font-karla'>
                      {provider.practiceName || 'Practice Name'}
                    </div>
                    <div className='text-sm text-[#333333] mb-1 font-karla'>
                      {getFormattedAddress()}
                    </div>
                    <div className='text-sm text-[#333333] mb-2 font-karla'>
                      {getCityStateZip()}
                    </div>
                  </div>
                  <div>
                    <a
                      href={getGoogleMapsDirectionsUrl()}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-base text-[#0334CB] font-medium underline font-karla'
                    >
                      Get Directions
                    </a>
                  </div>
                </div>
              </div>

              <button className='w-full py-3 bg-[#FFFFFF] text-[#061140] font-karla rounded-full font-semibold text-base border border-gray-200 hover:bg-gray-50'>
                See Full Information
              </button>
            </div>
          </div>

          {/* Right Content: About, Reviews, Education */}
          <div className='lg:col-span-2 space-y-8 mt-24'>
            {/* About Section - No white box, directly on background */}
            <div className='p-6'>
              <div className='text-[20px] font-[500] text-[#061140] mb-2 leading-[26px] font-montserrat'>
                About Dr.{' '}
                {provider.providerName
                  ? provider.providerName.split(' ').pop()
                  : 'Provider'}
              </div>
              <div className='text-[#484848]/80 mb-4 text-base font-karla'>
                Meet {provider.providerName || 'this provider'}.{' '}
                {provider.boardCertifications &&
                provider.boardCertifications.length > 0
                  ? `Board certified in ${provider.boardCertifications.join(
                      ', '
                    )}.`
                  : ''}{' '}
                {provider.specialties && provider.specialties.length > 0
                  ? `Specializing in ${provider.specialties.join(', ')}.`
                  : ''}
                <br />
                <br />
                {provider.practiceName || 'Their practice'} is committed to
                providing exceptional healthcare services to patients in{' '}
                {provider.city || 'this city'}, {provider.state || 'N/A'}.
              </div>
              <div className='mb-4'>
                <div className='font-[500] text-[#061140] mb-1 font-montserrat'>
                  Patients Say…
                </div>
                {stats.totalReviews > 0 ? (
                  <>
                    <div className='text-[#484848]/80 text-base mb-2 font-karla'>
                      {reviewsData?.reviews?.[0]?.reviewText ||
                        'Professional, knowledgeable, and caring. Highly recommended.'}
                    </div>
                    <div className='text-xs text-gray-500 mb-4'>
                      AI-generated from the text of customer reviews
                    </div>
                    <div className='flex flex-col sm:flex-row w-full bg-[#DFE3F2] rounded-[8px] px-4 sm:px-8 py-3 mb-2 gap-4 sm:gap-8 items-center justify-center'>
                      <div className='flex items-center gap-2 text-[#061140] text-base font-karla'>
                        <FaRegStar className='text-[#061140]' size={22} />
                        <span>
                          Reviews{' '}
                          <span className='font-semibold'>
                            {stats.averageSatisfactionRating.toFixed(1)} (
                            {stats.totalReviews})
                          </span>
                        </span>
                      </div>
                      <div className='flex items-center gap-2 text-[#061140] text-base font-karla'>
                        <FaRegThumbsUp className='text-[#061140]' size={22} />
                        <span>
                          Efficacy{' '}
                          <span className='font-semibold'>
                            {stats.averageEfficacyRating.toFixed(1)} (
                            {stats.totalReviews})
                          </span>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={fetchAllReviews}
                      className='w-full py-3 mt-4 bg-[#FFFFFF] text-[#061140] border font-karla border-[#7E7E7E]/50 rounded-full font-semibold text-base hover:bg-gray-50'
                    >
                      Read All Reviews ({stats.totalReviews})
                    </button>
                  </>
                ) : (
                  <>
                    <div className='text-[#484848]/80 text-base mb-2 font-karla'>
                      No reviews available yet. Be the first to leave a review!
                    </div>
                    <div className='flex flex-col sm:flex-row w-full bg-[#DFE3F2] rounded-[8px] px-4 sm:px-8 py-3 mb-2 gap-4 sm:gap-8 items-center justify-center'>
                      <div className='flex items-center gap-2 text-[#061140] text-base font-karla'>
                        <FaRegStar className='text-[#061140]' size={22} />
                        <span>
                          Reviews <span className='font-semibold'>- (0)</span>
                        </span>
                      </div>
                      <div className='flex items-center gap-2 text-[#061140] text-base font-karla'>
                        <FaRegThumbsUp className='text-[#061140]' size={22} />
                        <span>
                          Efficacy <span className='font-semibold'>- (0)</span>
                        </span>
                      </div>
                    </div>
                    <button
                      disabled
                      className='w-full py-3 mt-4 bg-gray-100 text-gray-400 border font-karla border-gray-200 rounded-full font-semibold text-base cursor-not-allowed'
                    >
                      No Reviews Yet
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className=' p-6'>
              <div className='text-[20px] font-[500] text-[#061140] mb-4 leading-[26px] font-montserrat'>
                Education & Qualifications
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-base font-karla'>
                <div>
                  <strong className='text-[#333333]'>Specialties</strong>
                </div>
                <div className='text-[#484848]/80'>{formatSpecialties()}</div>
                <div>
                  <strong className='text-[#333333]'>Practice</strong>
                </div>
                <div className='text-[#484848]/80'>
                  {provider.practiceName || 'N/A'}
                </div>
                {provider.boardCertifications &&
                  provider.boardCertifications.length > 0 && (
                    <>
                      <div>
                        <strong className='text-[#333333]'>
                          Board Certifications
                        </strong>
                      </div>
                      <div className='text-[#484848]/80'>
                        {provider.boardCertifications.map((cert, index) => (
                          <div key={index}>{cert}</div>
                        ))}
                      </div>
                    </>
                  )}
                {provider.hospitalAffiliations &&
                  provider.hospitalAffiliations.length > 0 && (
                    <>
                      <div>
                        <strong className='text-[#333333]'>
                          Hospital Affiliations
                        </strong>
                      </div>
                      <div className='text-[#484848]/80'>
                        {provider.hospitalAffiliations.map((aff, index) => (
                          <div key={index} className='mb-1'>
                            {aff}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                {provider.educationAndTraining &&
                  provider.educationAndTraining.length > 0 && (
                    <>
                      <div>
                        <strong className='text-[#333333]'>
                          Education & Training
                        </strong>
                      </div>
                      <div className='text-[#484848]/80'>
                        {provider.educationAndTraining.map((edu, index) => (
                          <div key={index} className='mb-2'>
                            {edu}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                <div>
                  <strong className='text-[#333333]'>NPI Number</strong>
                </div>
                <div className='text-[#484848]/80'>
                  {provider.npiNumber || 'N/A'}
                </div>
                  {provider.stateLicenses && provider.stateLicenses.length > 0 && (
                    <>
                      <div><strong className='text-[#333333]'>State Licenses</strong></div>
                      <div className='text-[#484848]/80'>
                        {provider.stateLicenses.map((license, index) => (
                          <div key={index} className='mb-2'>
                            <div className='font-medium'>{license.state}</div>
                            <div className='text-sm'>DEA: {license.deaNumber}</div>
                            <div className='text-sm'>License: {license.licenseNumber}</div>
                          </div>
                        ))}
                      </div>
                    </>
                )}
              </div>
            </div>

            {/* Ad Space - Empty */}
            <div className='bg-white rounded-3xl shadow-lg p-6 flex items-center justify-center min-h-[140px]'>
              <div className='w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center relative overflow-hidden'>
                <span className='text-gray-400 text-xs text-center'>
                  AD
                  <br />
                  [Advertisement Space]
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProviderProfile;