import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProvider } from "../services/api";
import Navbar from "../components/common/Navbar";
import { CiMobile2 } from "react-icons/ci";
import { FiSend } from "react-icons/fi";
import { IoBookmarkOutline } from "react-icons/io5";
import { FaRegStar, FaRegThumbsUp } from "react-icons/fa";

function ProviderProfile() {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProviderData();
  }, [providerId]);

  const getEmbeddedMapUrl = () => {
    const address = `${provider.address}, ${provider.city}, ${provider.state} ${provider.zip}`;
    const encodedAddress = encodeURIComponent(address);
    
    // Using OpenStreetMap export/embed - completely free
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(`${provider.city}, ${provider.state}`)}&layer=mapnik&marker=${encodedAddress}`;
  };

  const getMapBoxURL = () => {
    // Alternative: Generate a more precise OpenStreetMap embed URL
    const lat = 40.7128; // Default to NYC, will be replaced by actual coordinates if available
    const lon = -74.0060;
    const zoom = 15;
    
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.01},${lat-0.01},${lon+0.01},${lat+0.01}&layer=mapnik`;
  };

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getProvider(providerId);
      setProvider(data.provider || data);
    } catch (err) {
      console.error('Error fetching provider data:', err);
      setError('Failed to load provider information. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FCF8F4]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0C1F6D] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading provider information...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FCF8F4]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchProviderData}
              className="px-4 py-2 bg-[#0C1F6D] text-white rounded-lg hover:bg-[#0C1F6D]/90"
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
      <div className="min-h-screen flex flex-col bg-[#FCF8F4]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Provider Not Found</h2>
            <p className="text-gray-600">The provider you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to format specialties
  const formatSpecialties = () => {
    if (!provider.specialties || provider.specialties.length === 0) {
      return "Specialty information not available";
    }
    return provider.specialties.join(", ");
  };

  // Helper function to get the first specialty or a default
  const getPrimarySpecialty = () => {
    if (provider.specialties && provider.specialties.length > 0) {
      return provider.specialties[0];
    }
    return "Healthcare Provider";
  };

  // Helper function to format address parts
  const getFormattedAddress = () => {
    const parts = [];
    if (provider.address) parts.push(provider.address);
    if (provider.suite) parts.push(provider.suite);
    return parts.join(", ");
  };

  const getCityStateZip = () => {
    return `${provider.city}, ${provider.state} ${provider.zip}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCF8F4]">
      <Navbar />
      
      {/* Header Section with Image */}
      <div className="relative w-full h-full bg-[#F5F5F5] flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={provider.headshotUrl || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=400&fit=crop&crop=face"}
              alt={`${provider.providerName} - Profile`}
              className="object-cover w-full h-full max-h-full"
              style={{ objectPosition: "center top" }}
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=400&fit=crop&crop=center";
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto w-full gap-8 sm:px-4 sm:py-8 sm:-mt-32 -mt-4 z-10 relative">
        
        {/* Left Card: Contact & Office */}
        <div className="bg-white !border-[#7E7E7E]/50 !border rounded-[20px] p-6 w-full max-w-md flex-shrink-0 max-h-[600px]">
          <div className="mb-4">
            <div className="text-base text-gray-400 mb-1 font-karla">
              [{getPrimarySpecialty()}]
            </div>
            <div className="text-2xl font-[500] font-montserrat leading-[28px] text-[#061140] sm:mb-7 mb-4">
              {provider.providerName}
            </div>
            <div className="flex gap-2 mb-4">
              <button className="flex-1 font-karla py-3 px-2 bg-[#0C1F6D] text-white rounded-full font-medium text-base flex items-center justify-center gap-2">
                <CiMobile2 size={18} /> Call
              </button>
              <button 
                onClick={() => window.location.href = `mailto:${provider.email}`}
                className="flex-1 font-karla py-3 px-2 bg-[#0C1F6D] text-white rounded-full font-medium text-base flex items-center justify-center gap-2"
              >
                <FiSend size={18} /> Email
              </button>
              <button className="flex-1 py-3 px-2 font-karla bg-[#0C1F6D] text-white rounded-full font-medium text-base flex items-center justify-center gap-2">
                <IoBookmarkOutline size={18} /> Save
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="font-semibold text-[#061140] mb-2 text-sm">
              Office
            </div>
            
            {/* Free Map Implementation */}
            <div className="w-full h-40 bg-gray-200 rounded-xl mb-5 overflow-hidden">
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(`${provider.city}, ${provider.state}`)}&layer=mapnik`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                title={`Map showing ${provider.practiceName} location`}
                onError={(e) => {
                  // Fallback to a styled placeholder if map fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              ></iframe>
              
              {/* Fallback when iframe fails */}
              <div 
                className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center"
                style={{ display: 'none' }}
              >
                <div className="text-center text-gray-600">
                  <div className="text-2xl mb-2">📍</div>
                  <div className="text-sm font-medium">Map View</div>
                  <div className="text-xs">{provider.city}, {provider.state}</div>
                  <a
                    href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(`${provider.address}, ${provider.city}, ${provider.state} ${provider.zip}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 underline mt-1 block"
                  >
                    View on OpenStreetMap
                  </a>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <div className="text-base text-[#333333] mb-1 font-karla">
                  {provider.practiceName}
                </div>
                <div className="text-sm text-[#333333] mb-1 font-karla">
                  {getFormattedAddress()}
                </div>
                <div className="text-sm text-[#333333] mb-2 font-karla">
                  {getCityStateZip()}
                </div>
              </div>
              <div>
                <a
                  href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(provider.fullAddress || `${provider.address}, ${provider.city}, ${provider.state} ${provider.zip}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-[#0334CB] font-medium underline font-karla"
                >
                  Get Directions
                </a>
              </div>
            </div>
          </div>
          
          <button className="w-full sm:mt-4 py-3 bg-[#FFFFFF] text-[#061140] font-karla rounded-full font-semibold text-base border border-gray-200">
            See Full Information
          </button>
        </div>

        {/* Right Content: About, Reviews, Education */}
        <div className="flex-1 flex flex-col gap-8 sm:mt-[120px]">
          
          {/* About Section */}
          <div className="!border-[#7E7E7E]/50 !border-b p-6">
            <div className="text-[20px] font-[500] text-[#061140] mb-2 leading-[26px] font-montserrat">
              About Dr. {provider.providerName.split(' ').pop()}
            </div>
            <div className="text-[#484848]/80 mb-4 text-base font-karla">
              Meet {provider.providerName}. {provider.boardCertifications && provider.boardCertifications.length > 0 
                ? `Board certified in ${provider.boardCertifications.join(", ")}.` 
                : ""} 
              {provider.specialties && provider.specialties.length > 0 
                ? ` Specializing in ${provider.specialties.join(", ")}.` 
                : ""}
              <br />
              <br />
              {provider.practiceName} is committed to providing exceptional healthcare services 
              to patients in {provider.city}, {provider.state}.
            </div>
            
            {/* Patients Say Section */}
            <div className="mb-4">
              <div className="font-[500] text-[#061140] mb-1 font-montserrat">
                Patients Say…
              </div>
              <div className="text-[#484848]/80 text-base mb-2 font-karla">
                Professional, knowledgeable, and caring. Highly recommended for quality healthcare services.
              </div>
              <div className="flex w-full bg-[#DFE3F2] rounded-[8px] px-8 py-3 mb-2 gap-8 items-center justify-center">
                <div className="flex items-center gap-2 text-[#061140] text-base font-karla">
                  <FaRegStar className="text-[#061140]" size={22} />
                  <span>
                    Reviews&nbsp;{" "}
                    <span className="font-semibold">5.0 (0)</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#061140] text-base font-karla">
                  <FaRegThumbsUp className="text-[#061140]" size={22} />
                  <span>
                    Efficacy&nbsp;{" "}
                    <span className="font-semibold">5.0 (0)</span>
                  </span>
                </div>
              </div>
              <button className="w-full py-3 mt-4 bg-[#FFFFFF] text-[#061140] border font-karla border-[#7E7E7E]/50 rounded-full font-semibold text-base">
                Read Reviews (0)
              </button>
            </div>
          </div>

          {/* Education & Qualifications */}
          <div className="!border-[#7E7E7E]/50 !border-b p-6">
            <div className="text-[20px] font-[500] text-[#061140] mb-4 leading-[26px] font-montserrat">
              Education & Qualifications
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              
              {/* Specialties */}
              <div className="font-[700] text-[#333333] text-base font-karla">
                Specialties
              </div>
              <div className="text-[#484848]/80 text-base">
                {formatSpecialties()}
              </div>
              
              {/* Practice */}
              <div className="font-[700] text-[#333333] text-base font-karla">
                Practice
              </div>
              <div className="text-[#484848]/80 text-base">
                {provider.practiceName}
              </div>
              
              {/* Board Certifications */}
              {provider.boardCertifications && provider.boardCertifications.length > 0 && (
                <>
                  <div className="font-[700] text-[#333333] text-base font-karla">
                    Board Certifications
                  </div>
                  <div className="text-[#484848]/80 text-base">
                    {provider.boardCertifications.map((cert, index) => (
                      <div key={index}>{cert}</div>
                    ))}
                  </div>
                </>
              )}
              
              {/* Hospital Affiliations */}
              {provider.hospitalAffiliations && provider.hospitalAffiliations.length > 0 && (
                <>
                  <div className="font-[700] text-[#333333] text-base font-karla">
                    Hospital Affiliations
                  </div>
                  <div className="text-[#484848]/80 text-base">
                    {provider.hospitalAffiliations.map((affiliation, index) => (
                      <div key={index} className="mb-1">{affiliation}</div>
                    ))}
                  </div>
                </>
              )}
              
              {/* Education & Training */}
              {provider.educationAndTraining && provider.educationAndTraining.length > 0 && (
                <>
                  <div className="font-[700] text-[#333333] text-base font-karla">
                    Education & Training
                  </div>
                  <div className="text-[#484848]/80 text-base">
                    {provider.educationAndTraining.map((education, index) => (
                      <div key={index} className="mb-2">{education}</div>
                    ))}
                  </div>
                </>
              )}
              
              {/* NPI Number */}
              <div className="font-[700] text-[#333333] text-base font-karla">
                NPI Number
              </div>
              <div className="text-[#484848]/80 text-base">
                {provider.npiNumber}
              </div>
              
            </div>
          </div>

          {/* Ad/Procedure Supported by Provider */}
          <div className="bg-white rounded-3xl shadow-lg p-6 flex items-center justify-center min-h-[140px]">
            <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center">
              {provider.galleryUrl ? (
                <img 
                  src={provider.galleryUrl} 
                  alt="Procedures by provider"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span className="text-gray-400 text-xs text-center" style={{display: provider.galleryUrl ? 'none' : 'flex'}}>
                AD
                <br />
                [Procedure Supported by Provider]
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProviderProfile;