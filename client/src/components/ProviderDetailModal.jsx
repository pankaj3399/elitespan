// src/components/ProviderDetailModal.js

import React, { useEffect } from 'react';
import { X, Mail, Phone, MapPin, Award, Hospital, BookOpen, Fingerprint, Building, Calendar, FileText } from 'lucide-react';

// A helper component for displaying sections in the modal
const DetailSection = ({ title, icon: Icon, children }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-violet-800 mb-3 flex items-center">
      <Icon className="w-5 h-5 mr-3 text-violet-500" />
      {title}
    </h3>
    <div className="pl-8 border-l-2 border-violet-100">{children}</div>
  </div>
);

// A helper for list items
const InfoItem = ({ label, value }) => {
  if (!value) return null;
  return (
    <p className="text-slate-600 mb-1">
      <strong className="text-slate-800 font-medium">{label}:</strong> {value}
    </p>
  );
};

// A helper for displaying arrays as badges
const BadgeList = ({ items }) => {
  if (!items || items.length === 0) {
    return <p className="text-sm text-slate-400 italic">None listed.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span key={index} className="bg-violet-100 text-violet-800 px-2.5 py-1 rounded-md text-sm font-medium">
          {item}
        </span>
      ))}
    </div>
  );
};

const ProviderDetailModal = ({ provider, onClose }) => {
  // Effect to handle closing the modal with the 'Escape' key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!provider) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose} // Close modal on backdrop click
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-tr from-violet-200 to-pink-200 p-5 flex justify-between items-start border-b border-violet-300">
          <div>
            <h2 className="text-2xl font-bold text-violet-900">{provider.providerName}</h2>
            <p className="text-pink-800/90 font-medium">{provider.practiceName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-violet-800 hover:bg-white/50 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column with Headshot */}
            <div className="md:col-span-1">
              {provider.headshotUrl ? (
                <img src={provider.headshotUrl} alt={provider.providerName} className="rounded-lg w-full h-auto object-cover shadow-md mb-4" />
              ) : (
                <div className="rounded-lg w-full h-48 bg-slate-200 flex items-center justify-center text-slate-500 mb-4">No Image</div>
              )}
              <InfoItem label="Status" value={provider.isActive ? 'Active' : 'Inactive'} />
              <InfoItem label="Approval" value={provider.isApproved ? 'Approved' : 'Pending'} />
              <InfoItem label="Profile Complete" value={provider.isProfileComplete ? 'Yes' : 'No'} />
            </div>

            {/* Right Column with Details */}
            <div className="md:col-span-2">
              <DetailSection title="Contact Information" icon={MapPin}>
                <InfoItem label="Email" value={provider.email} />
                <InfoItem label="NPI Number" value={provider.npiNumber} />
                <InfoItem label="Address" value={provider.fullAddress} />
              </DetailSection>

              <DetailSection title="Qualifications" icon={Award}>
                <h4 className="font-semibold text-slate-700 mb-2">Specialties</h4>
                <BadgeList items={provider.specialties} />
                <h4 className="font-semibold text-slate-700 mt-4 mb-2">Board Certifications</h4>
                <BadgeList items={provider.boardCertifications} />
              </DetailSection>

              <DetailSection title="Affiliations & Education" icon={Hospital}>
                <h4 className="font-semibold text-slate-700 mb-2">Hospital Affiliations</h4>
                <BadgeList items={provider.hospitalAffiliations} />
                <h4 className="font-semibold text-slate-700 mt-4 mb-2">Education & Training</h4>
                <BadgeList items={provider.educationAndTraining} />
              </DetailSection>
              
              <DetailSection title="State Licenses" icon={Fingerprint}>
                 {provider.stateLicenses?.length > 0 ? (
                    <div className="space-y-3">
                        {provider.stateLicenses.map(lic => (
                            <div key={lic._id} className="p-3 bg-slate-100 rounded-md">
                                <p className="font-bold text-slate-800">{lic.state}</p>
                                <p className="text-sm text-slate-600">License: {lic.licenseNumber}</p>
                                <p className="text-sm text-slate-600">DEA: {lic.deaNumber}</p>
                            </div>
                        ))}
                    </div>
                 ) : <p className="text-sm text-slate-400 italic">None listed.</p>}
              </DetailSection>

              <DetailSection title="Practice Description" icon={FileText}>
                <p className="text-slate-600 whitespace-pre-wrap">{provider.practiceDescription || 'No description provided.'}</p>
              </DetailSection>
            </div>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
           <span><strong className="font-medium">Joined:</strong> {new Date(provider.createdAt).toLocaleDateString()}</span>
           <span><strong className="font-medium">Last Updated:</strong> {new Date(provider.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetailModal;