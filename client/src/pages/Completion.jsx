// client/src/pages/Completion.jsx

function Completion() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-white to-[#d9dff4]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-35 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1">
                        <h1 className="text-[40px] font-medium text-[#061140] lg:mb-6">Provider Portal Account</h1>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="md:border-l-3 border-l-[#7F92E5] md:pl-4 hidden md:block">
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

                    <div className="lg:col-span-3 lg:ml-25">
                        <div className="bg-[#DFE3F2] rounded-lg p-6">
                            <h2 className="text-[#061140] font-bold text-sm mb-2">
                                You’ve completed the Provider Portal form!
                            </h2>
                            <p className="text-[#061140] text-sm">
                                You will receive an email in 1–3 days to review your profile and make adjustments where you see fit.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Completion;