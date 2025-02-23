import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const FAQSection = () => {
  const faqs = [
    {
      question: "How does Elite Healthspan work?",
      answer: "Find and compare Highly Vetted Alternative Medicine doctors, watch masterclasses and find innovation!"
    },
    {
      question: "Is the Elite Healthspan membership free?",
      answer: "Searching for Alternative Medicine providers on Elite Healthspan is subscription based. Elite healthspan was created to provide..."
    },
    {
      question: "Where are the Doctors located?",
      answer: "With a curated network of thousands of doctors, there's several to choose from. And many are licensed in all 50 states!"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full py-16"
    >
      <h1 className="text-4xl font-bold text-center text-[#0A0F40] mb-16">
        How It Works
      </h1>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {faqs.map((faq, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
          >
            <h3 className="text-xl font-bold text-[#0A0F40] mb-4">
              {faq.question}
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              {faq.answer}
            </p>
            <button className="text-blue-600 font-semibold text-sm flex items-center gap-2">
              Read More
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mt-16"
      >
        <button className="px-8 py-4 bg-[#0A0F40] text-white rounded-full text-sm font-medium">
          View All Questions
        </button>
      </motion.div>
    </motion.div>
  );
};

export default FAQSection;