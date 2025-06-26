import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import QualificationInput from '../components/common/QualificationInput';
import { saveQualifications } from '../services/api';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa6';
import StateQualificationInput from '../components/StateQualificationInput';

const specialtiesOptions = [
  'Autoimmune',
  'Dentistry',
  'Functional Medicine',
  'Longevity Medicine',
  "Men's Health",
  'Neurodegenerative Disease',
  'Nutrition',
  'Orthopedic',
  'Regenerative Aesthetics',
  'Vision',
  "Women's Health",
];

// Use the same state abbreviations as ProviderPortal.jsx
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS',
  'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY',
  'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
  'WI', 'WY'
];

function Qualifications() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [providerId, setProviderId] = useState(null);

  const [formData, setFormData] = useState({
    specialties: [],
    boardCertifications: [''],
    hospitalAffiliations: [''],
    educationAndTraining: [''],
    stateLicenses: [{ state: '', deaNumber: '', licenseNumber: '' }], // NEW FIELD
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Get provider ID from localStorage
    const storedProviderId = localStorage.getItem('providerId');
    if (!storedProviderId) {
      // If no provider ID, redirect back to first step
      navigate('/provider-portal');
      return;
    }
    setProviderId(storedProviderId);
  }, [navigate]);

  const toggleSpecialty = (specialty) => {
    setFormData((prev) => {
      const current = prev.specialties;
      const updated = current.includes(specialty)
        ? current.filter((s) => s !== specialty)
        : [...current, specialty];
      return { ...prev, specialties: updated };
    });
  };

  const handleTextChange = (field, index, value) => {
    setFormData((prev) => {
      const updated = [...prev[field]];
      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  };

  // NEW: Handle state license changes
  const handleStateLicenseChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.stateLicenses];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, stateLicenses: updated };
    });
  };

  const addInputField = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  // NEW: Add state license entry
  const addStateLicense = () => {
    setFormData((prev) => ({
      ...prev,
      stateLicenses: [...prev.stateLicenses, { state: '', deaNumber: '', licenseNumber: '' }],
    }));
  };

  const removeInputField = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // NEW: Remove state license entry
  const removeStateLicense = (index) => {
    setFormData((prev) => ({
      ...prev,
      stateLicenses: prev.stateLicenses.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!providerId) {
      toast.error('Provider ID not found. Please start from the beginning.');
      navigate('/provider-portal');
      return;
    }

    // Validate state licenses
    const validStateLicenses = formData.stateLicenses.filter(license => 
      license.state.trim() !== '' || license.deaNumber.trim() !== '' || license.licenseNumber.trim() !== ''
    );

    for (const license of validStateLicenses) {
      if (!license.state.trim() || !license.deaNumber.trim() || !license.licenseNumber.trim()) {
        toast.error('Each state license must include state, DEA number, and license number.');
        return;
      }
    }

    // Check for duplicate states
    const states = validStateLicenses.map(license => license.state);
    const uniqueStates = new Set(states);
    if (states.length !== uniqueStates.size) {
      toast.error('Cannot have multiple licenses for the same state.');
      return;
    }

    // Update formData to only include valid state licenses
    const dataToSubmit = {
      ...formData,
      stateLicenses: validStateLicenses
    };

    setIsLoading(true);
    try {
      await saveQualifications(providerId, dataToSubmit);
      navigate('/profile-content');
    } catch (error) {
      console.error('Error saving qualifications:', error);
      toast.error('Error saving qualifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-white via-white to-[#d9dff4]'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-35 pb-8'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
          <div className='lg:col-span-1'>
            <h1
              style={{ fontFamily: 'Montserrat' }}
              className='text-[40px] font-medium text-[#061140] mb-6'
            >
              Provider Portal Account
            </h1>
            <div className='space-y-4'>
              <div className='flex items-start'>
                <div className='md:border-l-3 border-l-[#7F92E5] md:pl-4 hidden md:block'>
                  <h2
                    style={{ fontFamily: 'Montserrat' }}
                    className='font-medium text-[16px] text-[#061140]'
                  >
                    Practice Information
                  </h2>
                  <p
                    style={{ fontFamily: 'Karla' }}
                    className='text-sm text-[#484848]'
                  >
                    Share your practice&apos;s name and address details.
                  </p>
                </div>
              </div>
              <div className='flex items-start'>
                <div className='md:border-l-3 border-l-[#7F92E5] md:pl-4'>
                  <h2
                    style={{ fontFamily: 'Montserrat' }}
                    className='font-medium text-[16px] text-[#061140]'
                  >
                    Practitioner Qualifications
                  </h2>
                  <p
                    style={{ fontFamily: 'Karla' }}
                    className='text-sm text-[#484848]'
                  >
                    Outline your specialties, certifications, hospital
                    affiliations, and training.
                  </p>
                </div>
              </div>
              <div className='flex items-start opacity-50'>
                <div className='md:border-l-3 border-l-[#7E7E7E] md:pl-4 hidden md:block'>
                  <h2
                    style={{ fontFamily: 'Montserrat' }}
                    className='font-medium text-[16px] text-[#7E7E7E]'
                  >
                    Profile Content
                  </h2>
                  <p
                    style={{ fontFamily: 'Karla' }}
                    className='text-sm text-[#484848]'
                  >
                    Customize your profile with a headshot, image gallery, and
                    customer reviews.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='lg:col-span-2 lg:ml-25'>
            <form
              style={{ fontFamily: 'Karla' }}
              onSubmit={handleSubmit}
              className='space-y-6'
            >
              {formData.boardCertifications.map((value, index) => (
                <QualificationInput
                  key={`board-${index}`}
                  label={index === 0 ? 'Type of Medicine' : undefined}
                  name='boardCertifications'
                  index={index}
                  placeholder='Certification'
                  value={value}
                  onTextChange={(e) =>
                    handleTextChange(
                      'boardCertifications',
                      index,
                      e.target.value
                    )
                  }
                  onAddField={() => addInputField('boardCertifications')}
                  onRemoveField={(i) =>
                    removeInputField('boardCertifications', i)
                  }
                />
              ))}

              {formData.hospitalAffiliations.map((value, index) => (
                <QualificationInput
                  key={`hospital-${index}`}
                  label={
                    index === 0 ? 'Hospital Affiliations (Optional)' : undefined
                  }
                  name='hospitalAffiliations'
                  index={index}
                  placeholder='Position, Hospital Name'
                  value={value}
                  onTextChange={(e) =>
                    handleTextChange(
                      'hospitalAffiliations',
                      index,
                      e.target.value
                    )
                  }
                  onAddField={() => addInputField('hospitalAffiliations')}
                  onRemoveField={(i) =>
                    removeInputField('hospitalAffiliations', i)
                  }
                />
              ))}

              {formData.educationAndTraining.map((value, index) => (
                <QualificationInput
                  key={`education-${index}`}
                  label={index === 0 ? 'Education and Training' : undefined}
                  name='educationAndTraining'
                  index={index}
                  placeholder='University, Degree'
                  value={value}
                  onTextChange={(e) =>
                    handleTextChange(
                      'educationAndTraining',
                      index,
                      e.target.value
                    )
                  }
                  onAddField={() => addInputField('educationAndTraining')}
                  onRemoveField={(i) =>
                    removeInputField('educationAndTraining', i)
                  }
                />
              ))}

              {formData.stateLicenses.map((license, index) => (
                <StateQualificationInput
                  key={`state-license-${index}`}
                  label={index === 0 ? 'State Licenses' : undefined}
                  name='stateLicenses'
                  index={index}
                  license={license}
                  states={US_STATES}
                  onLicenseChange={handleStateLicenseChange}
                  onAddField={addStateLicense}
                  onRemoveField={removeStateLicense}
                />
              ))}

              <div className='relative'>
                <label
                  htmlFor='specialties'
                  className='block text-[16px] font-normal text-[#484848]'
                >
                  Specialties (Select all that apply)
                </label>
                <div
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className='mt-1 flex items-center justify-between w-full border border-[#7E7E7E] text-sm text-[#7E7E7E] rounded-md py-2 px-3 cursor-pointer focus:outline-none'
                >
                  <div
                    className='flex flex-wrap gap-2'
                    onClick={(e) => e.stopPropagation()} // prevent reopening dropdown when clicking chips
                  >
                    {formData.specialties.length > 0 ? (
                      formData.specialties.map((spec) => (
                        <div
                          key={spec}
                          className='flex items-center bg-[#DFE3F2] text-[#061140] px-2 rounded-xs text-xs'
                        >
                          <span className='mr-1'>{spec}</span>
                          <button
                            type='button'
                            onClick={() => toggleSpecialty(spec)}
                            className='text-black text-[18px] focus:outline-none pb-[2px]'
                          >
                            &times;
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className='text-[#7E7E7E]'>Select Specialties</span>
                    )}
                  </div>
                  {dropdownOpen ? (
                    <FaChevronUp className='ml-2 h-[18px] w-[18px] text-[#484848]' />
                  ) : (
                    <FaChevronDown className='ml-2 h-[18px] w-[18px] text-[#484848]' />
                  )}
                </div>

                {dropdownOpen && (
                  <div className='z-10 mt-2 w-full border border-[#7E7E7E] rounded-md shadow-md max-h-48 overflow-y-auto'>
                    {specialtiesOptions.map((option) => (
                      <label
                        key={option}
                        className='flex items-center px-4 py-2 text-sm text-[#484848] hover:bg-[#DFE3F2] cursor-pointer'
                      >
                        <input
                          type='checkbox'
                          checked={formData.specialties.includes(option)}
                          onChange={() => toggleSpecialty(option)}
                          className='mr-2 accent-[#0C1F6D] text-[#0C1F6D] rounded border-[#7E7E7E] focus:ring-[#0C1F6D] cursor-pointer'
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className='grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6'>
                <div className='col-span-1'>
                  <button
                    type='button'
                    onClick={() => navigate('/provider-portal')}
                    className='w-full sm:w-32 flex justify-center py-4 px-4 md:px-20 border text-[#061140] border-[#7E7E7E] rounded-full shadow-sm text-sm font-medium hover:border-[#162241]'
                  >
                    Back
                  </button>
                </div>
                <div className='col-span-1'>
                  <button
                    type='submit'
                    className='w-full sm:w-32 flex justify-center items-center gap-2 py-4 px-4 md:px-20 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#0C1F6D] hover:bg-[#162241]'
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className='animate-spin h-5 w-5 text-white'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                            fill='none'
                          />
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                          />
                        </svg>
                        <span>Loading...</span>
                      </>
                    ) : (
                      'Continue'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Qualifications;