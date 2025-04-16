import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import StyledFileInput from '../components/common/StyledFileInput';
import { MdOutlineFileUpload } from "react-icons/md";
import { IoMdArrowDown } from "react-icons/io";

function ProfileContent() {
    const navigate = useNavigate();

    const [uploadedFiles, setUploadedFiles] = useState({
        headshot: null,
        gallery: null,
        reviews: null,
    });

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFileSelect = (field, file) => {
        if (!file) return;

        if ((field === 'headshot' || field === 'gallery') &&
            !['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            alert('Only JPG/PNG image files are allowed for this field.');
            return;
        }

        if (field === 'reviews' &&
            !['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
                .includes(file.type)) {
            alert('Only .xls/.xlsx files are allowed for Client Reviews.');
            return;
        }

        setUploadedFiles((prev) => ({
            ...prev,
            [field]: file,
        }));
    };

    const handleClearFile = (field) => {
        setUploadedFiles((prev) => ({
            ...prev,
            [field]: null,
        }));
    };

    const getCloudinarySignature = async () => {
        const res = await fetch('http://localhost:3000/signature', {
            method: 'POST',
        });
        return res.json();
    };

    const uploadToCloudinary = async (file, signatureData) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', signatureData.apiKey);
        formData.append('timestamp', signatureData.timestamp);
        formData.append('signature', signatureData.signature);

        const isExcel = file.type.includes('spreadsheet') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx');
        const resourceType = isExcel ? 'raw' : 'image';

        const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/${resourceType}/upload`;

        const res = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        return data.secure_url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);

        const { headshot, gallery, reviews } = uploadedFiles;

        if (!headshot || !gallery || !reviews) {
            alert("Please upload all required files before continuing.");
            return;
        }

        setLoading(true); // Show loader

        try {
            const signatureData = await getCloudinarySignature();

            const headshotUrl = await uploadToCloudinary(headshot, signatureData);
            const galleryUrl = await uploadToCloudinary(gallery, signatureData);
            const reviewsUrl = await uploadToCloudinary(reviews, signatureData);

            await fetch('http://localhost:3000/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ headshotUrl, galleryUrl, reviewsUrl }),
            });

            console.log('Uploaded successfully:', { headshotUrl, galleryUrl, reviewsUrl });
            navigate('/completion');
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Upload failed, please try again.');
        } finally {
            setLoading(false); // Hide loader
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-[#061140] font-medium">Uploading your files, please wait...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-white to-[#d9dff4]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-35 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1">
                        <h1 className="text-[40px] font-medium text-[#061140] mb-6">
                            Provider Portal Account
                        </h1>
                        <div className="space-y-4">
                            {["Practice Information", "Practitioner Qualifications", "Profile Content"].map((title, i) => (
                                <div className="flex items-start" key={i}>
                                    <div className={`md:border-l-3 border-l-[#7F92E5] md:pl-4 ${i < 2 ? 'hidden md:block' : ''}`}>
                                        <h2 className="font-medium text-[16px] text-[#061140]">{title}</h2>
                                        <p className="text-sm text-[#484848]">
                                            {{
                                                0: "Share your practice's name and address details.",
                                                1: "Outline your specialties, certifications, hospital affiliations, and training.",
                                                2: "Customize your profile with a headshot, image gallery, and customer reviews."
                                            }[i]}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-2 lg:ml-25">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <StyledFileInput
                                label="Professional Headshot"
                                subLabel="Image dimensions are 400PX x 400PX (1:1)"
                                onChange={(e) => handleFileSelect('headshot', e.target.files[0])}
                                onClear={() => handleClearFile('headshot')}
                                fileName={uploadedFiles.headshot?.name}
                                fileUrl={uploadedFiles.headshot ? URL.createObjectURL(uploadedFiles.headshot) : ''}
                                Icon={MdOutlineFileUpload}
                                accept=".jpg,.jpeg,.png"
                                isImage
                                submitted={submitted}
                            />

                            <StyledFileInput
                                label="Gallery Photo"
                                subLabel="Image dimensions are 700PX x 525PX (4:3)"
                                onChange={(e) => handleFileSelect('gallery', e.target.files[0])}
                                onClear={() => handleClearFile('gallery')}
                                fileName={uploadedFiles.gallery?.name}
                                fileUrl={uploadedFiles.gallery ? URL.createObjectURL(uploadedFiles.gallery) : ''}
                                Icon={MdOutlineFileUpload}
                                accept=".jpg,.jpeg,.png"
                                isImage
                                submitted={submitted}
                            />

                            <StyledFileInput
                                label="Client Reviews"
                                subLabel="Import .XLS file. Include Client Name, Review, and Satisfaction rating."
                                onChange={(e) => handleFileSelect('reviews', e.target.files[0])}
                                onClear={() => handleClearFile('reviews')}
                                fileName={uploadedFiles.reviews?.name}
                                Icon={IoMdArrowDown}
                                accept=".xls,.xlsx"
                                isImage={false}
                                submitted={submitted}
                            />

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                                <div className="col-span-1">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/qualifications')}
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

export default ProfileContent;
