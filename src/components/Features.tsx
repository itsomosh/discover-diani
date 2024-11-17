import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Compass, Users, Gift } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: "Smart Local Guide",
    description: "Chat with our AI guide about anything Diani - from hidden gems to local favorites."
  },
  {
    icon: Compass,
    title: "Curated Experiences",
    description: "Discover handpicked activities, restaurants, and stays that match your vibe."
  },
  {
    icon: Users,
    title: "Local Insights",
    description: "Get authentic recommendations from our community of locals and seasoned travelers."
  },
  {
    icon: Gift,
    title: "Exclusive Perks",
    description: "Unlock special deals and hidden gems as you explore more of Diani."
  }
];

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          variants={itemVariants}
        >
          <h2 className="text-4xl font-bold mb-6 gradient-text animate-gradient">
            Experience Diani Like Never Before
          </h2>
          <p className="text-gray-600 text-lg">
            Your all-in-one companion for unlocking the treasures of Kenya's most beautiful beach destination
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  scale: 1.03,
                  transition: { duration: 0.2 }
                }}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                <div className="relative">
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-6"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className="h-8 w-8 text-primary" />
                  </motion.div>
                  
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}