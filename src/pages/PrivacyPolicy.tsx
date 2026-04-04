import React from 'react';
import { SEO } from '../components/SEO';
import { motion } from 'framer-motion';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen pt-10 pb-20">
      <SEO title="Privacy Policy" />
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-12 rounded-2xl"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white">
            Privacy <span className="text-neon-purple">Policy</span>
          </h1>
          
          <div className="space-y-6 text-text-secondary leading-relaxed text-lg">
            <p className="text-sm italic mb-8">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
            <p>
              We collect information that you provide to us when you create an account, 
              such as your name and email address. We also collect usage data, 
              including your IP address, browser type, and the pages you visit.
            </p>
            
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. How We Use Your Information</h2>
            <p>
              We use your information to provide and improve our services, 
              to communicate with you, and to personalize your experience on Potato TV. 
              We do not sell your personal information to third parties.
            </p>
            
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Data Security</h2>
            <p>
              We take reasonable measures to protect your personal information from 
              unauthorized access, use, or disclosure. However, no method of 
              transmission over the internet is 100% secure.
            </p>
            
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Cookies</h2>
            <p>
              We use cookies to enhance your experience on our platform. 
              Cookies are small data files that are stored on your device. 
              You can choose to disable cookies in your browser settings.
            </p>
            
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Third-Party Links</h2>
            <p>
              Potato TV may contain links to third-party websites. 
              We are not responsible for the privacy practices or content of these websites.
            </p>
            
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">6. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information. 
              If you have any questions or concerns about your privacy, 
              please contact us at animeadows5@gmail.com.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
