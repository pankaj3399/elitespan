import React from 'react';
import { motion } from 'framer-motion';

const MembershipSection = () => {
  const features = [
    {
      title: "Connections",
      description: "Connect with top Providers, Scientists, Practitioners, and Advisors in Alternative Medicine.",
      icon: "📱"
    },
    {
      title: "Learning",
      description: "Access state of the art knowledge and insights from industry leaders.",
      icon: "📚"
    },
    {
      title: "Exploration",
      description: "Discover innovative therapies, treatments and products that go beyond conventional approaches.",
      icon: "🔍"
    }
  ];

  return (
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
          <span className="text-7xl font-bold text-[#0A0F40]">$9.99</span>
          <span className="text-xl text-[#0A0F40] ml-1">/month</span>
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
              <p className="text-[#4B5563]">
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
          className="w-full bg-[#0A0F40] text-white py-4 rounded-lg font-medium hover:bg-[#151b5e] transition-colors"
        >
          Join Elite Healthspan
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MembershipSection;