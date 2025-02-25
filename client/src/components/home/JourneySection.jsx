import React from 'react';
import { motion } from 'framer-motion';
import { Square } from 'lucide-react';

const JourneySection = () => {
  const journeysFirstRow = [
    "Functional Health",
    "Arthritis & Orthopedic",
    "Autoimmune",
    "Neurodegenerative Diseases"
  ];
  
  const journeysSecondRow = [
    "Longevity & Age Management",
    "Men's Health",
    "Regenerative Aesthetics",
    "Women's Health"
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full py-16"
    >
      <h1 className="text-4xl font-bold text-center text-[#0A0F40] mb-12">
        Which Elite Healthspan Journey is Yours?
      </h1>
      
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 px-4">
        {/* First Row */}
        <div className="flex flex-wrap justify-center gap-4">
          {journeysFirstRow.map((journey, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-gray-200 text-gray-700 hover:border-[#0A0F40] hover:text-[#0A0F40] transition-colors"
            >
              <Square className="w-4 h-4 text-[#0A0F40]" />
              <span className="text-sm font-medium">{journey}</span>
            </motion.button>
          ))}
        </div>
        
        {/* Second Row */}
        <div className="flex flex-wrap justify-center gap-4">
          {journeysSecondRow.map((journey, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: (index + journeysFirstRow.length) * 0.1, ease: "easeOut" }}
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-gray-200 text-gray-700 hover:border-[#0A0F40] hover:text-[#0A0F40] transition-colors"
            >
              <Square className="w-4 h-4 text-[#0A0F40]" />
              <span className="text-sm font-medium">{journey}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default JourneySection;