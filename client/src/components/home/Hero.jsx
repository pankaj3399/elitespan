import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="text-center py-40 px-6 bg-white"
    >
      <h1 className="text-4xl md:text-5xl font-bold text-[#0B0757] mb-4">
        Unleash the Power of Optimal Health
      </h1>
      <p className="text-xl text-gray-600 mb-8">
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
      >
        Join HealthSpan
      </motion.button>
    </motion.section>
  );
};

export default Hero;