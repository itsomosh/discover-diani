import React, { useState } from 'react';
import { SearchBar } from './SearchBar';
import { Button } from './Button';
import { BetaSignupModal } from './BetaSignupModal';
import { BusinessRegistrationModal } from './BusinessRegistrationModal';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export function Hero() {
  const [isBetaModalOpen, setBetaModalOpen] = useState(false);
  const [isBusinessModalOpen, setBusinessModalOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Background Elements */}
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMTIxMjEiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJsLTIgMnYyaDJ2MmgyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-accent/20" />
      </motion.div>

      <div className="container mx-auto px-4 text-center">
        <motion.div variants={itemVariants}>
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="gradient-text animate-gradient">
              Your Gateway to Paradise in Diani
            </span>
          </h1>
        </motion.div>

        <motion.div variants={itemVariants}>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
            Discover the magic of Diani Beach - where pristine sands meet vibrant local culture. Your perfect adventure starts here!
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <SearchBar />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => setBetaModalOpen(true)}
          >
            Join Our Beta Program
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white text-primary rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => setBusinessModalOpen(true)}
          >
            List Your Business – 3 Months Free
          </motion.button>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            delay: 1,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        >
          <button
            onClick={scrollToFeatures}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Scroll to features"
          >
            <ChevronDown className="w-6 h-6 text-gray-600" />
          </button>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-24 fill-white" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,100 C30,90 70,90 100,100 L100,100 L0,100 Z" />
        </svg>
      </div>

      <BetaSignupModal isOpen={isBetaModalOpen} onClose={() => setBetaModalOpen(false)} />
      <BusinessRegistrationModal isOpen={isBusinessModalOpen} onClose={() => setBusinessModalOpen(false)} />
    </motion.section>
  );
}