import React from 'react';
import { SEO } from '../components/SEO';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send } from 'lucide-react';

export const Contact = () => {
  return (
    <div className="min-h-screen pt-10 pb-20">
      <SEO title="Contact Us" />
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-12 rounded-2xl"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white text-center">
            Get in <span className="text-neon-purple">Touch</span>
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Contact Information</h2>
              <p className="text-text-secondary leading-relaxed">
                Have questions, feedback, or need support? We're here to help! 
                Reach out to us through any of the following channels.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-text-secondary">
                  <div className="w-12 h-12 rounded-full bg-neon-purple/10 flex items-center justify-center text-neon-purple">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary/60">Email Us</p>
                    <a href="mailto:animeadows5@gmail.com" className="text-white hover:text-neon-purple transition-colors font-medium">
                      animeadows5@gmail.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-text-secondary">
                  <div className="w-12 h-12 rounded-full bg-neon-purple/10 flex items-center justify-center text-neon-purple">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary/60">Support</p>
                    <p className="text-white font-medium">24/7 Online Support</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 p-8 rounded-2xl border border-white/5">
              <h3 className="text-xl font-semibold text-white mb-6">Send a Message</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors"
                    placeholder="Your Email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Message</label>
                  <textarea 
                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-purple transition-colors h-32 resize-none"
                    placeholder="Your Message"
                  ></textarea>
                </div>
                <button className="w-full bg-neon-purple text-white font-bold py-3 rounded-lg hover:bg-neon-purple/90 transition-all flex items-center justify-center gap-2">
                  <Send size={18} /> Send Message
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
