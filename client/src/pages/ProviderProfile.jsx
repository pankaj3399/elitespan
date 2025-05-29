import React from "react";
import Navbar from "../components/common/Navbar";
import hero from "../assets/hero.png";
import { CiMobile2 } from "react-icons/ci";
import { FiSend } from "react-icons/fi";
import { IoBookmarkOutline } from "react-icons/io5";
import { FaRegStar, FaRegThumbsUp } from "react-icons/fa";

function ProviderProfile() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FCF8F4]">
      <Navbar />
      {/* Header Section with Image and Back Button */}
      <div className="relative w-full h-full bg-[#F5F5F5] flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          {/* Placeholder for profile image */}
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={hero}
              alt="Provider"
              className="object-cover w-full h-full max-h-full"
              style={{ objectPosition: "center top" }}
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
              [Type of Medicine]
            </div>
            <div className="text-2xl font-[500] font-montserrat leading-[28px] text-[#061140] sm:mb-7 mb-4">
              Charles A. Guglin MD FACS
            </div>
            <div className="flex gap-2 mb-4">
              <button className="flex-1 font-karla py-3 px-2 bg-[#0C1F6D] text-white rounded-full font-medium text-base flex items-center justify-center gap-2">
                <CiMobile2 size={18} /> Call
              </button>
              <button className="flex-1 font-karla py-3 px-2 bg-[#0C1F6D] text-white rounded-full font-medium text-base flex items-center justify-center gap-2">
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
            {/* Map Placeholder */}
            <div className="w-full h-40 bg-gray-200 rounded-xl flex items-center justify-center mb-5">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.983038638889!2d-73.04373448457033!3d41.17811517928743!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e7d672f7628351%3A0x6e838d26a2058412!2s88%20Noble%20Ave%2C%20Milford%2C%20CT%2006460!5e0!3m2!1sen!2sus!4v1717066666666!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-base text-[#333333] mb-1 font-karla">
                  HyperFit MD
                </div>
                <div className="text-sm text-[#333333] mb-1 font-karla">
                  88 Noble Ave, Ste 105
                </div>
                <div className="text-sm text-[#333333] mb-2 font-karla">
                  Milford, CT 06460
                </div>
              </div>
              <div>
                <a
                  href="#"
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
              About Dr. Guglin
            </div>
            <div className="text-[#484848]/80 mb-4 text-base font-karla">
              Meet Dr. Charles Guglin, MD FACS. With his extensive training and
              experience, you can rest assured that you are in good hands. Dr.
              Guglin was born and raised in Rochester, NY. After receiving a BS
              from SUNY at Albany, NY, he went to medical school at the
              University of Pittsburgh School of Medicine.
              <br />
              <br />
              Dr. Guglin went through General Surgery Residency training,
              initially at New Britain General Hospital in New Britain, CT then
              completed a Trauma Fellowship and wrapped up his General Surgery
              training at Hartford Hospital in Hartford, CT.
            </div>
            {/* Patients Say Section */}
            <div className="mb-4">
              <div className="font-[500] text-[#061140] mb-1 font-montserrat">
                Patients Say…
              </div>
              <div className="text-[#484848]/80 text-base mb-2 font-karla">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore.
              </div>
              <div className="flex w-full bg-[#DFE3F2] rounded-[8px] px-8 py-3 mb-2 gap-8 items-center justify-center">
                <div className="flex items-center gap-2 text-[#061140] text-base font-karla">
                  <FaRegStar className="text-[#061140]" size={22} />
                  <span>
                    Reviews&nbsp;{" "}
                    <span className="font-semibold">5.0 (00)</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#061140] text-base font-karla">
                  <FaRegThumbsUp className="text-[#061140]" size={22} />
                  <span>
                    Efficacy&nbsp;{" "}
                    <span className="font-semibold">5.0 (00)</span>
                  </span>
                </div>
              </div>
              <button className="w-full py-3 mt-4 bg-[#FFFFFF] text-[#061140] border font-karla border-[#7E7E7E]/50 rounded-full font-semibold text-base">
                Read Reviews (00)
              </button>
            </div>
          </div>

          {/* Education & Qualifications */}
          <div className="!border-[#7E7E7E]/50 !border-b p-6">
            <div className="text-[20px] font-[500] text-[#061140] mb-4 leading-[26px] font-montserrat">
              Education & Qualifications
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="font-[700] text-[#333333] text-base font-karla">
                Specialties
              </div>
              <div className="text-[#484848]/80 text-base">
                Specialty 1, Specialty 2, Specialty 3
              </div>
              <div className="font-[700] text-[#333333] text-base font-karla">
                Owner
              </div>
              <div>HyperFit MD Age Management Center</div>
              <div className="font-[700] text-[#333333] text-base font-karla">
                Hospital Affiliations
              </div>
              <div>
                <div className="font-[500] text-[#484848]/80 text-base font-karla">
                  Partner
                </div>
                Surgical Associates of Milford 1989-2017
                <br />
                <div className="font-[500] text-[#484848]/80 text-base font-karla mt-2">
                  President of Medical Staff
                </div>
                Milford Hospital
                <br />
                2008-2012
                <br />
                <div className="font-[500] text-[#484848]/80 text-base font-karla mt-2">
                  Chief of Surgery
                </div>
                Milford General Hospital
                <br />
                2001-2010
                <br />
                <div className="font-[500] text-[#484848]/80 text-base font-karla mt-2">
                  General Surgery
                </div>
                University of CT Affiliated Residency Program at Hartford
                Hospital & U. Conn. Health Center
                <br />
                1986-1989
                <br />
                <div className="font-[500] text-[#484848]/80 text-base font-karla mt-2">
                  General Surgery
                </div>
                New Britain General Hospital
                <br />
                New Britain, CT
                <br />
                1982-1985
                <br />
                <div className="font-[500] text-[#484848]/80 text-base font-karla mt-2">
                  Fellowship EMS/Trauma
                </div>
                Hartford Hospital, Hartford, CT 1982-1983
              </div>
              <div className="font-[700] text-[#333333] text-base font-karla">
                Education & Training
              </div>
              <div>
                University of Pittsburgh
                <br />
                School of Medicine
                <br />
                MD Degree, 1978-1982
                <br />
                State University of New York
                <br />
                BS in Biology, 1974-1978
              </div>
            </div>
          </div>

          {/* Ad/Procedure Supported by Provider */}
          <div className="bg-white rounded-3xl shadow-lg p-6 flex items-center justify-center min-h-[140px]">
            <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-gray-400 text-xs">
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
