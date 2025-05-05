import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const FAQSection = () => {
  const faqs = [
    {
      question: "How does Elite Healthspan work?",
      answer:
        "Find and compare highly vetted Alternative Medicine doctors, watch masterclasses and find innovation!",
    },
    {
      question: "Is the Elite Healthspan membership free?",
      answer:
        "Searching for Alternative Medicine providers on Elite Healthspan is subscription based. Elite healthspan was created to provide...",
    },
    {
      question: "Where are the Doctors located?",
      answer:
        "With a curated network of thousands of doctors, there's several to choose from. And many are licensed in all 50 states!",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full py-16"
    >
      <h1
        style={{ fontFamily: "Montserrat" }}
        className="text-2xl md:text-[40px] font-bold text-center text-[#061140] mb-16"
      >
        How It Works
      </h1>

      <div className="max-w-7xl sm:h-[390px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-[#7E7E7E]/40 pt-[80px]"
          >
            <h3 className="text-[16px] md:text-2xl font-medium text-[#061140] mb-4">
              {faq.question}
            </h3>
            <p className="text-[#484848] font-normal mb-6 text-sm md:text-lg font-karla">
              {faq.answer}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center sm:mt-16 mt-6"
      >
        <button className="px-[108px] cursor-pointer md:px-[135px] py-4 bg-[#0C1F6D] text-[#FFFFFF] rounded-full text-[16px] text-sm font-bold font-karla">
          View All Questions
        </button>
      </motion.div>
    </motion.div>
  );
};

export default FAQSection;
