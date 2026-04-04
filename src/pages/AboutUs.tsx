import React from 'react';
import { SEO } from '../components/SEO';
import { motion } from 'framer-motion';

export const AboutUs = () => {
  return (
    <div className="min-h-screen pt-10 pb-20">
      <SEO title="About Us" />
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-12 rounded-2xl"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white">
            About <span className="text-neon-purple">Potato TV</span>
          </h1>
          
          <div className="space-y-6 text-text-secondary leading-relaxed text-lg">
            <p>
              Welcome to Potato TV, your ultimate destination for high-quality anime streaming. 
              We are passionate anime fans who believe that everyone should have access to their 
              favorite shows in the best possible quality, without the hassle.
            </p>
            
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Our Mission</h2>
            <p>
              Our mission is to provide a seamless, modern, and enjoyable streaming experience for 
              the global anime community. We focus on speed, accessibility, and a clean interface 
              that lets the content shine.
            </p>
            
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Why Potato TV?</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li>High-definition streaming with multiple server options.</li>
              <li>A massive library of both classic and trending anime.</li>
              <li>Fast loading times and a responsive design for all devices.</li>
              <li>A community-driven platform built by fans, for fans.</li>
            </ul>
            
            <p className="mt-8">
              Thank you for choosing Potato TV. We are constantly working to improve our platform 
              and bring you the best anime experience possible.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
