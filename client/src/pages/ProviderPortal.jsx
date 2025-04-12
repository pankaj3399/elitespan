// client/src/pages/ProviderPortal.jsx
import React, { useState } from 'react';

function App() {
  const [formData, setFormData] = useState({
    practiceName: '',
    providerName: '',
    npiNumber: '',
    address: '',
    suite: '',
    city: '',
    state: '',
    zip: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-[#d9dff4]">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-35 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <h1 className="text-[40px] font-medium text-[#061140] mb-6">Provider Portal Account</h1>
            <div className="space-y-4">
              <div className="flex items-start">
                {/* <div className="w-1 bg-blue-600 h-full mr-3"></div> */}
                <div className="md:border-l-3 border-l-[#7F92E5] md:pl-4">
                  <h2 className="font-medium text-[16px] text-[#061140]">Practice Information</h2>
                  <p className="text-sm text-[#484848]">Share your practice's name and address details.</p>
                </div>
              </div>
              <div className="flex items-start opacity-50">
                {/* <div className="w-1 bg-transparent h-full mr-3"></div> */}
                <div className="md:border-l-3 border-l-[#7E7E7E] md:pl-4 hidden md:block">
                  <h2 className="font-medium text-[16px] text-[#7E7E7E]">Practitioner Qualifications</h2>
                  <p className="text-sm text-[#484848]">Outline your specialties, certifications, hospital affiliations, and training.</p>
                </div>
              </div>
              <div className="flex items-start opacity-50">
                {/* <div className="w-1 bg-transparent h-full mr-3"></div> */}
                <div className="md:border-l-3 border-l-[#7E7E7E] md:pl-4 hidden md:block">
                  <h2 className="font-medium text-[16px] text-[#7E7E7E]">Profile Content</h2>
                  <p className="text-sm text-[#484848]">Customize your profile with a headshot, image gallery, and customer reviews.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 lg:ml-25">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/** All form fields here — unchanged except `maxLength` should be in lowercase */}
              <div>
                <label htmlFor="practiceName" className="block text-[16px] font-normal text-[#484848]">Name of Practice</label>
                <input
                  type="text"
                  name="practiceName"
                  id="practiceName"
                  value={formData.practiceName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-[#7E7E7E] text-sm text-[#7E7E7E] rounded-md  py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#061140] focus:border-[#061140]"
                  placeholder="Practice"
                />
              </div>

              <div>
                <label htmlFor="providerName" className="block text-[16px] font-normal text-[#484848]">Provider / Practitioner Name</label>
                <input
                  type="text"
                  name="providerName"
                  id="providerName"
                  value={formData.providerName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-[#7E7E7E] text-sm text-[#7E7E7E] rounded-md  py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#061140] focus:border-[#061140]"
                  placeholder="Provider"
                />
              </div>

              <div>
                <label htmlFor="npiNumber" className="block text-[16px] font-normal text-[#484848]">NPI Number</label>
                <input
                  type="text"
                  name="npiNumber"
                  id="npiNumber"
                  value={formData.npiNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-[#7E7E7E] text-sm text-[#7E7E7E] rounded-md  py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#061140] focus:border-[#061140]"
                  placeholder="0000000000"
                  maxLength="10"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-[16px] font-normal text-[#484848]">Address</label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-[#7E7E7E] text-sm text-[#7E7E7E] rounded-md  py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#061140] focus:border-[#061140]"
                  placeholder="Address"
                />
              </div>

              <div>
                <label htmlFor="suite" className="block text-[16px] font-normal text-[#484848]">Apartment, Suite, etc.</label>
                <input
                  type="text"
                  name="suite"
                  id="suite"
                  value={formData.suite}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-[#7E7E7E] text-sm text-[#7E7E7E] rounded-md  py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#061140] focus:border-[#061140]"
                  placeholder="Apartment, Suite, etc."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="sm:col-span-2">
                  <label htmlFor="city" className="block text-[16px] font-normal text-[#484848]">City</label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-[#7E7E7E] text-sm text-[#7E7E7E] rounded-md  py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#061140] focus:border-[#061140]"
                    placeholder="City"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="state" className="block text-[16px] font-normal text-[#484848]">State</label>
                  <select
                    name="state"
                    id="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-[#7E7E7E] text-sm text-[#7E7E7E] rounded-md  py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#061140] focus:border-[#061140]"
                  >
                    <option value="">State</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="zip" className="block text-sm font-normal text-[#484848]">ZIP</label>
                  <input
                    type="text"
                    name="zip"
                    id="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-[#7E7E7E] text-sm text-[#7E7E7E] rounded-md  py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#061140] focus:border-[#061140]"
                    placeholder="ZIP"
                    maxLength="5"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full sm:w-32 flex justify-center py-4 px-4 md:px-20 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#0C1F6D] hover:bg-[#162241]"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
