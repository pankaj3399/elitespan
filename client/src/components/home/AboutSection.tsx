import React from 'react'
import suzanneImage from '../../assets/Shuzzane.png'
import philImage from '../../assets/man.png'
import mariaImage from '../../assets/maria.png'


function AboutSection() {
    return (
        <div>

            <section className="py-16 px-4 max-w-7xl mx-auto">
                {/* Main heading and subheading */}
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-[#061140] mb-6 leading-tight">
                        Our mission is to provide you with
                        <br />
                        the insights and innovation you need,
                        <br />
                        to take charge of your health.
                    </h2>
                    <p className="text-xl sm:block hidden md:text-3xl text-[#061140] leading-relaxed font-extralight">
                        You'll benefit from expertise beyond
                        <br />
                        individual doctors; empowering you to unlock
                        <br />a longer, more vibrant healthspan.
                    </p>
                    <p className="text-xl sm:hidden block md:text-3xl text-[#061140] leading-relaxed font-extralight">
                        You'll benefit from expertise beyond
                        <br />
                        individual doctors; empowering you to unlock
                        a longer, more vibrant healthspan.
                    </p>
                    {/* About Us button */}
                    <div className="mt-8">
                        <a
                            href="#"
                            className="inline-block border border-gray-300 rounded-full py-3 w-[300px] text-[#0a1045] bg-[#FFFFFF] font-medium hover:bg-gray-50 transition-colors"
                        >
                            About Us
                        </a>
                    </div>
                </div>

                {/* Testimonial cards */}
                {/* Mobile horizontal scroll - hidden on md+ */}
                <div className="block md:hidden overflow-x-auto">
                    <div className="flex gap-4 px-4 py-4">
                        {/* Card */}
                        <div className="flex-shrink-0 w-[85vw] rounded-3xl overflow-hidden relative h-[500px]">
                            <img src={suzanneImage} alt="Suzanne" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                                <h3 className="text-white text-xl font-bold mb-3">Suzanne's Story</h3>
                                <p className="text-white text-sm font-karla">
                                    Suzanne was feeling sluggish, frustrated and unheard. She met with one of our trusted providers, now she's feeling energized!
                                </p>
                            </div>
                        </div>

                        <div className="flex-shrink-0 w-[85vw] rounded-3xl overflow-hidden relative h-[500px]">
                            <img src={philImage} alt="Phil" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                                <h3 className="text-white text-xl font-bold mb-3">Phil's Story</h3>
                                <p className="text-white text-sm font-karla">
                                    Phil wants to take a deeper dive into his health. He's meeting with one of our trusted providers to explore advanced diagnostics.
                                </p>
                            </div>
                        </div>

                        <div className="flex-shrink-0 w-[85vw] rounded-3xl overflow-hidden relative h-[500px]">
                            <img src={mariaImage} alt="Maria" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                                <h3 className="text-white text-xl font-bold mb-3">Maria's Story</h3>
                                <p className="text-white text-sm font-karla">
                                    Maria wants the most advanced care for her joints. She was able to learn about regenerative treatments and now feels more empowered.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop grid layout - hidden on mobile */}
                <div className="hidden md:grid grid-cols-3 gap-6 px-8">
                    {/* Reuse the same card content as above, just without w-[85vw] and flex-shrink */}
                    <div className="rounded-3xl overflow-hidden relative h-[500px]">
                        <img src={suzanneImage} alt="Suzanne" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                            <h3 className="text-white text-2xl font-bold mb-3">Suzanne's Story</h3>
                            <p className="text-white text-base font-karla">
                                Suzanne was feeling sluggish, frustrated and unheard. She met with one of our trusted providers, now she's feeling energized!
                            </p>
                        </div>
                    </div>

                    <div className="rounded-3xl overflow-hidden relative h-[500px]">
                        <img src={philImage} alt="Phil" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                            <h3 className="text-white text-2xl font-bold mb-3">Phil's Story</h3>
                            <p className="text-white text-base font-karla">
                                Phil wants to take a deeper dive into his health. He's meeting with one of our trusted providers to explore advanced diagnostics.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-3xl overflow-hidden relative h-[500px]">
                        <img src={mariaImage} alt="Maria" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                            <h3 className="text-white text-2xl font-bold mb-3">Maria's Story</h3>
                            <p className="text-white text-base font-karla">
                                Maria wants the most advanced care for her joints. She was able to learn about regenerative treatments and now feels more empowered.
                            </p>
                        </div>
                    </div>
                </div>


            </section>


        </div>
    )
}

export default AboutSection