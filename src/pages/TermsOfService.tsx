import React from 'react';
import { SEO } from '../components/SEO';
import { motion } from 'framer-motion';

export const TermsOfService = () => {
  return (
    <div className="min-h-screen pt-10 pb-20">
      <SEO title="Terms of Service" />
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-12 rounded-2xl"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white">
            Terms of <span className="text-neon-purple">Service</span>
          </h1>
          
          <div className="space-y-6 text-text-secondary leading-relaxed text-lg">
            <p className="text-sm italic mb-8">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Potato TV, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our platform.
            </p>
            
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Use of Content</h2>
            <p>
              Potato TV is a streaming platform that provides access to anime content. 
              The content is provided for personal, non-commercial use only. 
              You may not reproduce, distribute, or modify any content without proper authorization.
            </p>
            
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. User Conduct</h2>
            <p>
              You agree to use Potato TV in a lawful manner and not to engage in any activity 
              that could harm the platform or its users. This includes, but is not limited to, 
              uploading malicious code, spamming, or attempting to gain unauthorized access.
            </p>
            
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Account Responsibility</h2>
            <p>
              If you create an account on Potato TV, you are responsible for maintaining the 
              confidentiality of your login information and for all activities that occur under your account.
            </p>
            
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Disclaimer</h2>
            <p>
              Potato TV is provided "as is" without any warranties. We do not guarantee the 
              availability, accuracy, or reliability of the platform or its content.
            </p>
            
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">6. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. 
              Your continued use of the platform after any changes indicates your acceptance of the new terms.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
