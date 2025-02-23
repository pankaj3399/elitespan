import React from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import logo from "../../assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="w-full py-4 px-6 flex items-center justify-between fixed top-0 z-50 bg-white shadow-md">
      <div className="text-2xl font-bold text-[#0B0757]">
        <img src={logo} alt="Elite Healthspan" className="h-15" />
      </div>
      
      <div className="hidden md:flex items-center gap-8">
        <a href="#how" className="text-[#64748B] hover:text-[#0B0757] font-medium">How It Works</a>
        <a href="#about" className="text-[#64748B] hover:text-[#0B0757] font-medium">About Elite</a>
        <a href="#faq" className="text-[#64748B] hover:text-[#0B0757] font-medium">FAQ</a>
        <a href="#login" className="text-[#64748B] hover:text-[#0B0757] font-medium">Login</a>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-[#0B0757] text-white rounded-full hover:bg-[#1a237e] font-medium"
        >
          Join Elite Healthspan
        </motion.button>
      </div>
      
      <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X className="w-6 h-6 text-[#0B0757]" /> : <Menu className="w-6 h-6 text-[#0B0757]" />}
      </button>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-16 right-0 w-64 bg-white shadow-lg rounded-lg p-4 md:hidden"
        >
          <a href="#how" className="block py-2 text-[#64748B] hover:text-[#0B0757] font-medium">How It Works</a>
          <a href="#about" className="block py-2 text-[#64748B] hover:text-[#0B0757] font-medium">About Elite</a>
          <a href="#faq" className="block py-2 text-[#64748B] hover:text-[#0B0757] font-medium">FAQ</a>
          <a href="#login" className="block py-2 text-[#64748B] hover:text-[#0B0757] font-medium">Login</a>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 w-full py-2 text-[#0B0757] font-semibold border border-[#0B0757] rounded-full hover:bg-[#0B0757] hover:text-white"
          >
            Join Elite Healthspan
          </motion.button>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;