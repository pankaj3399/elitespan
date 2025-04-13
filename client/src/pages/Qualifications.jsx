// client/src/pages/Qualifications.jsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import InputWithFileUpload from '../components/common/InputWithFileUpload';

function Qualifications() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        specialties: '',
        boardCertifications: [''],
        hospitalAffiliations: [''],
        educationAndTraining: [''],
    });

    const [uploadedFiles, setUploadedFiles] = useState({
        boardCertifications: [''],
        hospitalAffiliations: [''],
        educationAndTraining: [''],
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleTextChange = (field, index, value) => {
        setFormData((prev) => {
            const updated = [...prev[field]];
            updated[index] = value;
            return { ...prev, [field]: updated };
        });
    };

    const handleFileSelect = (field, fileName, index) => {
        setUploadedFiles((prev) => {
            const updated = [...prev[field]];
            updated[index] = fileName;
            return { ...prev, [field]: updated };
        });
    };

    const handleClearFile = (field, index) => {
        setUploadedFiles((prev) => {
            const updated = [...prev[field]];
            updated[index] = '';
            return { ...prev, [field]: updated };
        });
    };

    const addInputField = (field) => {
        setFormData((prev) => ({
            ...prev,
            [field]: [...prev[field], ''],
        }));
        setUploadedFiles((prev) => ({
            ...prev,
            [field]: [...prev[field], ''],
        }));
    };

    const removeInputField = (field, index) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }));
        setUploadedFiles((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData, uploadedFiles);
        navigate('/profile-content');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-white to-[#d9dff4]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-35 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1">
                        <h1 className="text-[40px] font-medium text-[#061140] mb-6">
                            Provider Portal Account
                        </h1>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="md:border-l-3 border-l-[#7F92E5] md:pl-4 hidden md:block">
                                    <h2 className="font-medium text-[16px] text-[#061140]">Practice Information</h2>
                                    <p className="text-sm text-[#484848]">Share your practice&apos;s name and address details.</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="md:border-l-3 border-l-[#7F92E5] md:pl-4">
                                    <h2 className="font-medium text-[16px] text-[#061140]">Practitioner Qualifications</h2>
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
                                <label htmlFor="specialties" className="block text-[16px] font-normal text-[#484848]">Specialties</label>
                                <input
                                    type="text"
                                    name="specialties"
                                    id="specialties"
                                    value={formData.specialties}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-[#7E7E7E] text-sm text-[#7E7E7E] rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#061140] focus:border-[#061140]"
                                    placeholder="Specialties"
                                />
                            </div>
                            {formData.boardCertifications.map((value, index) => (
                                <InputWithFileUpload
                                    key={`board-${index}`}
                                    label={index === 0 ? 'Board Certifications' : undefined}
                                    name="boardCertifications"
                                    index={index}
                                    placeholder="Certification 1, School Name"
                                    value={value}
                                    onTextChange={(e) => handleTextChange('boardCertifications', index, e.target.value)}
                                    onFileSelect={(name, fileName) => handleFileSelect(name, fileName, index)}
                                    onClearFile={(name) => handleClearFile(name, index)}
                                    fileName={uploadedFiles.boardCertifications[index]}
                                    onAddField={() => addInputField('boardCertifications')}
                                    onRemoveField={(i) => removeInputField('boardCertifications', i)}
                                />
                            ))}

                            {formData.hospitalAffiliations.map((value, index) => (
                                <InputWithFileUpload
                                    key={`hospital-${index}`}
                                    label={index === 0 ? 'Hospital Affiliations (Optional)' : undefined}
                                    name="hospitalAffiliations"
                                    index={index}
                                    placeholder="Position, Hospital Name"
                                    value={value}
                                    onTextChange={(e) => handleTextChange('hospitalAffiliations', index, e.target.value)}
                                    onFileSelect={(name, fileName) => handleFileSelect(name, fileName, index)}
                                    onClearFile={(name) => handleClearFile(name, index)}
                                    fileName={uploadedFiles.hospitalAffiliations[index]}
                                    onAddField={() => addInputField('hospitalAffiliations')}
                                    onRemoveField={(i) => removeInputField('hospitalAffiliations', i)}
                                />
                            ))}

                            {formData.educationAndTraining.map((value, index) => (
                                <InputWithFileUpload
                                    key={`education-${index}`}
                                    label={index === 0 ? 'Education and Training' : undefined}
                                    name="educationAndTraining"
                                    index={index}
                                    placeholder="University, Degree"
                                    value={value}
                                    onTextChange={(e) => handleTextChange('educationAndTraining', index, e.target.value)}
                                    onFileSelect={(name, fileName) => handleFileSelect(name, fileName, index)}
                                    onClearFile={(name) => handleClearFile(name, index)}
                                    fileName={uploadedFiles.educationAndTraining[index]}
                                    onAddField={() => addInputField('educationAndTraining')}
                                    onRemoveField={(i) => removeInputField('educationAndTraining', i)}
                                />
                            ))}



                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                                <div className="col-span-1">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/provider-portal')}
                                        className="w-full sm:w-32 flex justify-center py-4 px-4 md:px-20 border text-[#061140] border-[#7E7E7E] rounded-full shadow-sm text-sm font-medium hover:border-[#162241]"
                                    >
                                        Back
                                    </button>
                                </div>
                                <div className="col-span-1">
                                    <button
                                        type="submit"
                                        className="w-full sm:w-32 flex justify-center py-4 px-4 md:px-20 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#0C1F6D] hover:bg-[#162241]"
                                    >
                                        Continue
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
