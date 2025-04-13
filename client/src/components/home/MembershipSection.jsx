// client/src/components/MembershipSection.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import MembershipModal from '../MembershipModal';
import ContactInfoForm from '../ContactInfoForm';
import PaymentMethodModal from '../PaymentMethodModal';
import CreditCardForm from '../CreditCardForm';
import { useAuth } from '../../contexts/AuthContext';

const MembershipSection = () => {
  const [modalStep, setModalStep] = useState(null);
  const { user, token } = useAuth();

  const features = [
    {
      title: "Connections",
      description: "Connect with providers, scientists, and advisors providing innovative healthcare solutions.",
      icon: "📱",
    },
    {
      title: "Learning",
      description: "Access state of the art knowledge and insights from industry leaders.",
      icon: "📚",
    },
    {
      title: "Exploration",
      description: "Discover innovative therapies, treatments and products that go beyond conventional approaches.",
      icon: "🔍",
    },
  ];

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
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col md:flex-row justify-between items-start gap-12 p-8 max-w-7xl w-[80%] mx-auto bg-white rounded-lg shadow-lg"
      >
        <div className="flex-1">
          <h2 className="text-4xl font-bold text-[#0A0F40] mb-2">
            Membership starts at
          </h2>
          <div className="flex items-baseline">
            <span className="text-7xl font-bold text-[#0A0F40]">$119.88</span>
            <span className="text-xl text-[#0A0F40] ml-1">/year</span>
          </div>
          <p className="text-[#6B7280] mt-2">Charged annually</p>
        </div>

        <div className="flex-1 space-y-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 flex items-center justify-center bg-blue-50 rounded">
                <span className="text-xl">{feature.icon}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0A0F40] mb-1">
                  {feature.title}
                </h3>
                <p className="text-[#4B5563]">{feature.description}</p>
              </div>
            </motion.div>
          ))}
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            className="w-full bg-[#0A0F40] text-white py-4 rounded-lg font-medium hover:bg-[#151b5e] transition-colors"
            onClick={handleJoinClick}
          >
            Join Elite Healthspan
          </motion.button>
        </div>
      </motion.div>

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

export default MembershipSection;