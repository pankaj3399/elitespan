// client/src/pages/ProviderPortal.jsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { saveProviderInfo } from '../services/api';

function ProviderPortal() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

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

    const [errors, setErrors] = useState({
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

        // Real-time validation
        setErrors(prev => ({
            ...prev,
            [name]: value.trim() === '' ? 'This field is required.' : ''
        }));

        // Specific validation for NPI Number
        if (name === 'npiNumber') {
            const isValid = /^\d{10}$/.test(value);
            setErrors(prev => ({
                ...prev,
                npiNumber: isValid || value === '' ? '' : 'Invalid NPI Number. It must be 10 digits.'
            }));
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        Object.entries(formData).forEach(([key, value]) => {
            if (!value.trim()) {
                newErrors[key] = 'This field is required.';
            }
        });

        if (formData.npiNumber && !/^\d{10}$/.test(formData.npiNumber)) {
            newErrors.npiNumber = 'Invalid NPI Number. It must be 10 digits.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsLoading(true);
            await saveProviderInfo(formData);
            console.log('Form submitted and saved to DB');
            navigate('/qualifications');
        } catch (error) {
            console.error('Error submitting provider info:', error.message);
        } finally {
            setIsLoading(false);
        }
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-35 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1">
                        <h1 className="text-[40px] font-medium text-[#061140] mb-6">Provider Portal Account</h1>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="md:border-l-3 border-l-[#7F92E5] md:pl-4">
                                    <h2 className="font-medium text-[16px] text-[#061140]">Practice Information</h2>
                                    <p className="text-sm text-[#484848]">Share your practice&apos;s name and address details.</p>
                                </div>
                            </div>
                            <div className="flex items-start opacity-50">
                                <div className="md:border-l-3 border-l-[#7E7E7E] md:pl-4 hidden md:block">
                                    <h2 className="font-medium text-[16px] text-[#7E7E7E]">Practitioner Qualifications</h2>
                                    <p className="text-sm text-[#484848]">Outline your specialties, certifications, hospital affiliations, and training.</p>
                                </div>
                            </div>
                            <div className="flex items-start opacity-50">
                                <div className="md:border-l-3 border-l-[#7E7E7E] md:pl-4 hidden md:block">
                                    <h2 className="font-medium text-[16px] text-[#7E7E7E]">Profile Content</h2>
                                    <p className="text-sm text-[#484848]">Customize your profile with a headshot, image gallery, and customer reviews.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 lg:ml-25">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="practiceName" className={`block text-[16px] font-normal ${errors.practiceName ? `text-[#8D1315]` : `text-[#484848]`}`}>Name of Practice</label>
                                <input
                                    type="text"
                                    name="practiceName"
                                    id="practiceName"
                                    value={formData.practiceName}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full border text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 ${errors.practiceName
                                        ? 'border-[#8D1315] text-[#8D1315] focus:ring-[#8D1315] focus:border-[#8D1315]'
                                        : 'border-[#7E7E7E] text-[#7E7E7E] focus:ring-[#061140] focus:border-[#061140]'
                                        }`}
                                    placeholder="Practice"
                                />

                                {errors.practiceName && (
                                    <p className="text-[#8D1315] text-[10px] mt-1">{errors.practiceName}</p>
                                )}

                            </div>

                            <div>
                                <label htmlFor="providerName" className={`block text-[16px] font-normal ${errors.providerName ? `text-[#8D1315]` : `text-[#484848]`}`}>Provider / Practitioner Name</label>
                                <input
                                    type="text"
                                    name="providerName"
                                    id="providerName"
                                    value={formData.providerName}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full border text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 ${errors.providerName
                                        ? 'border-[#8D1315] text-[#8D1315] focus:ring-[#8D1315] focus:border-[#8D1315]'
                                        : 'border-[#7E7E7E] text-[#7E7E7E] focus:ring-[#061140] focus:border-[#061140]'
                                        }`}
                                    placeholder="Provider"
                                />

                                {errors.providerName && (
                                    <p className="text-[#8D1315] text-[10px] mt-1">{errors.providerName}</p>
                                )}

                            </div>

                            <div>
                                <label htmlFor="npiNumber" className={`block text-[16px] font-normal ${errors.npiNumber ? `text-[#8D1315]` : `text-[#484848]`}`}>NPI Number</label>
                                <input
                                    type="text"
                                    name="npiNumber"
                                    id="npiNumber"
                                    value={formData.npiNumber}
                                    onChange={handleChange}
                                    onKeyDown={(e) => {
                                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab') {
                                            e.preventDefault();
                                        }
                                    }}
                                    className={`mt-1 block w-full border text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 ${errors.npiNumber
                                        ? 'border-[#8D1315] text-[#8D1315] focus:ring-[#8D1315] focus:border-[#8D1315]'
                                        : 'border-[#7E7E7E] text-[#7E7E7E] focus:ring-[#061140] focus:border-[#061140]'
                                        }`}
                                    placeholder="0000000000"
                                    maxLength="10"
                                />
                                {errors.npiNumber && (
                                    <p className="text-[#8D1315] text-[10px] mt-1">{errors.npiNumber}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="address" className={`block text-[16px] font-normal ${errors.address ? `text-[#8D1315]` : `text-[#484848]`}`}>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    id="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full border text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 ${errors.address
                                        ? 'border-[#8D1315] text-[#8D1315] focus:ring-[#8D1315] focus:border-[#8D1315]'
                                        : 'border-[#7E7E7E] text-[#7E7E7E] focus:ring-[#061140] focus:border-[#061140]'
                                        }`}
                                    placeholder="Address"
                                />

                                {errors.address && (
                                    <p className="text-[#8D1315] text-[10px] mt-1">{errors.address}</p>
                                )}

                            </div>

                            <div>
                                <label htmlFor="suite" className={`block text-[16px] font-normal ${errors.suite ? `text-[#8D1315]` : `text-[#484848]`}`}>Apartment, Suite, etc.</label>
                                <input
                                    type="text"
                                    name="suite"
                                    id="suite"
                                    value={formData.suite}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full border text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 ${errors.suite
                                        ? 'border-[#8D1315] text-[#8D1315] focus:ring-[#8D1315] focus:border-[#8D1315]'
                                        : 'border-[#7E7E7E] text-[#7E7E7E] focus:ring-[#061140] focus:border-[#061140]'
                                        }`}
                                    placeholder="Apartment, Suite, etc."
                                />

                                {errors.suite && (
                                    <p className="text-[#8D1315] text-[10px] mt-1">{errors.suite}</p>
                                )}

                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                                <div className="sm:col-span-2">
                                    <label htmlFor="city" className={`block text-[16px] font-normal ${errors.city ? `text-[#8D1315]` : `text-[#484848]`}`}>City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        id="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full border text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 ${errors.city
                                            ? 'border-[#8D1315] text-[#8D1315] focus:ring-[#8D1315] focus:border-[#8D1315]'
                                            : 'border-[#7E7E7E] text-[#7E7E7E] focus:ring-[#061140] focus:border-[#061140]'
                                            }`}
                                        placeholder="City"
                                    />

                                    {errors.city && (
                                        <p className="text-[#8D1315] text-[10px] mt-1">{errors.city}</p>
                                    )}

                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="state" className={`block text-[16px] font-normal ${errors.state ? `text-[#8D1315]` : `text-[#484848]`}`}>State</label>
                                    <select
                                        name="state"
                                        id="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full border text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 ${errors.state
                                            ? 'border-[#8D1315] text-[#8D1315] focus:ring-[#8D1315] focus:border-[#8D1315]'
                                            : 'border-[#7E7E7E] text-[#7E7E7E] focus:ring-[#061140] focus:border-[#061140]'
                                            }`}
                                    >
                                        <option value="">State</option>
                                        {states.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>

                                    {errors.state && (
                                        <p className="text-[#8D1315] text-[10px] mt-1">{errors.state}</p>
                                    )}

                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="zip" className={`block text-[16px] font-normal ${errors.zip ? `text-[#8D1315]` : `text-[#484848]`}`}>ZIP</label>
                                    <input
                                        type="text"
                                        name="zip"
                                        id="zip"
                                        value={formData.zip}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full border text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 ${errors.zip
                                            ? 'border-[#8D1315] text-[#8D1315] focus:ring-[#8D1315] focus:border-[#8D1315]'
                                            : 'border-[#7E7E7E] text-[#7E7E7E] focus:ring-[#061140] focus:border-[#061140]'
                                            }`}
                                        placeholder="ZIP"
                                        maxLength="5"
                                    />

                                    {errors.zip && (
                                        <p className="text-[#8D1315] text-[10px] mt-1">{errors.zip}</p>
                                    )}

                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="w-full sm:w-32 flex justify-center items-center gap-2 py-4 px-4 md:px-20 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#0C1F6D] hover:bg-[#162241]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                            </svg>
                                            <span>Loading...</span>
                                        </>
                                    ) : (
                                        "Continue"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProviderPortal;
