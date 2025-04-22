// client/src/components/Hero.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import MembershipModal from '../MembershipModal';
import ContactInfoForm from '../ContactInfoForm';
import PaymentMethodModal from '../PaymentMethodModal';
import CreditCardForm from '../CreditCardForm';
import { useAuth } from '../../contexts/AuthContext';

const Hero = () => {
  const [modalStep, setModalStep] = useState(null);
  const { user, token } = useAuth();

  const handleJoinClick = () => {
    setModalStep('membership');
  };

  const closeModals = () => {
    setModalStep(null);
  };

  const handleContinue = (nextStep) => {
    setModalStep(nextStep);
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative text-center pt-30 px-6 min-h-[85vh] overflow-hidden"
      >
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/heroVideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50 z-0" />


        {/* Content Overlay */}
        <div className="relative z-10">
          <h1
            className="text-[30px] md:text-5xl font-bold text-[#FFFFFF] md:mb-4 mt-16"
          >
            Empowering You
            to Optimize Your Health
          </h1>
          <p
            className=" text-[27px] md:text-5xl text-[#FFFFFF] mb-8"
            style={{ fontWeight: 300 }}
          >
            Access our trusted education, innovation
            and expertise
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="px-12 md:px-8 py-3 bg-[#0C1F6D] text-white rounded-full text-lg hover:bg-[#1a237e]"
            onClick={handleJoinClick}
          >
            Join Elite Healthspan
          </motion.button>
        </div>
      </motion.section>

      {/* Modals */}
      {modalStep === 'membership' && (
        <MembershipModal
          onClose={closeModals}
          onContinue={() => handleContinue('contactInfo')}
        />
      )}
      {modalStep === 'contactInfo' && (
        <ContactInfoForm
          onClose={closeModals}
          // eslint-disable-next-line no-unused-vars
          onContinue={(userId) => handleContinue('paymentMethod')}
          userId={user ? user.id : null}
        />
      )}
      {modalStep === 'paymentMethod' && (
        <PaymentMethodModal
          onClose={closeModals}
          onContinue={(paymentMethod) => handleContinue(`paymentForm_${paymentMethod}`)}
          userId={user ? user.id : null}
        />
      )}
      {modalStep === 'paymentForm_creditCard' && (
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

export default Hero;
