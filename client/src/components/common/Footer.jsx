import React from 'react';
import { motion } from 'framer-motion';
import logo from "../../assets/logo.png"; // Reusing the same logo from Navbar

const Footer = () => {
  const footerLinks = [
    {
      title: "Explore",
      links: [
        { name: "How It Works", href: "#how" },
        { name: "About Elite", href: "#about" },
        { name: "FAQ", href: "#faq" },
      ]
    },
    {
      title: "Journeys",
      links: [
        { name: "Longevity & Age Management", href: "#journeys" },
        { name: "Men's Health", href: "#journeys" },
        { name: "Women's Health", href: "#journeys" },
      ]
    },
    {
      title: "Connect",
      links: [
        { name: "Login", href: "#login" },
        { name: "Join Elite Healthspan", href: "#join" },
        { name: "Contact Us", href: "#contact" },
      ]
    }
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full py-16 bg-[#0A0F40] text-white"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo and Description with improved visibility */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <div className="mb-4 flex items-center">
              <img 
                src={logo} 
                alt="Elite Healthspan" 
                className="h-12 w-auto bg-white p-2 rounded-md" // Added white background with padding
              />
            </div>
            <p className="text-sm text-gray-300">
              Unleashing the power of optimal health through education, 
              innovation, and expertise.
            </p>
          </motion.div>

          {/* Footer Link Sections */}
          {footerLinks.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.2 + 0.2, ease: "easeOut" }}
            >
              <h3 className="text-lg font-bold text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-sm text-gray-300 mb-4 md:mb-0">
            © {new Date().getFullYear()} Elite Healthspan. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#privacy"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;