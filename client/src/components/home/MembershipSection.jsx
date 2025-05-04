import { useState } from "react";
import { motion } from "framer-motion";
import MembershipModal from "../MembershipModal";
import ContactInfoForm from "../ContactInfoForm";
import PaymentMethodModal from "../PaymentMethodModal";
import CreditCardForm from "../CreditCardForm";
import { useAuth } from "../../contexts/AuthContext";

const MembershipSection = () => {
  const [modalStep, setModalStep] = useState(null);
  const { user, token } = useAuth();

  const features = [
    {
      title: "Connections",
      description:
        "Connect with top Providers, Scientists, Practitioners, and Advisors in Alternative Medicine.",
    },
    {
      title: "Learning",
      description:
        "Access state of the art knowledge and insights from industry leaders.",
    },
    {
      title: "Exploration",
      description:
        "Discover innovative therapies, treatments and products that go beyond conventional approaches.",
    },
  ];

  const handleJoinClick = () => {
    setModalStep("membership");
  };

  const closeModals = () => {
    setModalStep(null);
  };

  const handleContinue = (nextStep) => {
    setModalStep(nextStep);
  };

  return (
    <>
      <div className="px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 justify-between border border-[#7E7E7E]/40 px-4 md:px-8 sm:py-[110px] py-[50px] w-full sm:max-w-7xl sm:mx-auto bg-white sm:rounded-[20px] rounded-[10px]"
        >
          {/* Left Section */}
          <div className="flex-1 min-w-0 md:border-r border-[#7E7E7E] px-6">
            <h2 className="inline-block text-[#061140] text-lg md:text-2xl font-medium px-2 py-1 rounded mb-4 sm:mt-[70px]">
              Membership starts at
            </h2>
            <div className="flex items-baseline ">
              <span className="text-[72px] md:text-[120px] font-medium text-[#0C1F6D] leading-none">
                $9.99
              </span>
              <span className="text-lg md:text-4xl font-medium text-[#061140] ml-1">
                /month
              </span>
            </div>
            <p className="text-sm md:text-2xl text-[#7E7E7E] m-4 font-normal font-karla">
              Charged annually at $119.88
            </p>
          </div>

          {/* Right Section */}
          <div className="flex-1 min-w-0 space-y-8 px-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.2,
                  ease: "easeOut",
                }}
                className="flex items-start gap-4"
              >
                <div className="min-w-[32px] min-h-[32px] bg-[#FFF6E7] rounded flex items-center justify-center">
                  <img
                    src="/icon_image.png"
                    alt="Feature Icon"
                    className="w-5 h-5"
                  />
                </div>
                <div>
                  <h3 className="text-[#0C1F6D] font-bold text-[16px] md:text-xl mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-[#484848] text-sm font-normal font-karla  border-b border-gray-200 pb-4 ">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}

            <motion.button
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
              className="w-full bg-[#0C1F6D] cursor-pointer text-white py-4 rounded-full font-bold text-[16px] hover:bg-[#151b5e] transition-colors font-karla"
              onClick={handleJoinClick}
            >
              Join Elite Healthspan
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      {modalStep === "membership" && (
        <MembershipModal
          onClose={closeModals}
          onContinue={() => handleContinue("contactInfo")}
        />
      )}
      {modalStep === "contactInfo" && (
        <ContactInfoForm
          onClose={closeModals}
          onContinue={(userId) => handleContinue("paymentMethod")}
          userId={user ? user.id : null}
        />
      )}
      {modalStep === "paymentMethod" && (
        <PaymentMethodModal
          onClose={closeModals}
          onContinue={(paymentMethod) =>
            handleContinue(`paymentForm_${paymentMethod}`)
          }
          userId={user ? user.id : null}
        />
      )}
      {modalStep === "paymentForm_creditCard" && (
        <CreditCardForm
          onClose={closeModals}
          onContinue={closeModals}
          userId={user ? user.id : null}
          token={token}
        />
      )}
    </>
  );
};

export default MembershipSection;
