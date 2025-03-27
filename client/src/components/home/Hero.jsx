// client/src/components/Hero.jsx
import React, { useState } from 'react';
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
        className="text-center pt-30 px-6"
      >
        <h1
          className="text-4xl md:text-5xl font-bold text-[#061140] mb-4"
          style={{ fontWeight: 700, fontSize: '48px' }}
        >
          Unleash the Power of Optimal Health
        </h1>
        <p
          className="text-xl text-[#061140] mb-8"
          style={{ fontWeight: 300, fontSize: '48px' }}
        >
          Through Education, Innovation and Expertise
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="px-8 py-3 bg-[#0B0757] text-white rounded-full text-lg hover:bg-[#1a237e]"
          onClick={handleJoinClick}
        >
          Get Started
        </motion.button>
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