import React from 'react';
import { Navbar } from '../components/Navbar';
import { motion } from 'framer-motion';
import { Github, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
      <footer className="bg-secondary-dark border-t border-white/5 py-10 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Potato<span className="text-neon-purple">TV</span></h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                The best place to watch anime online for free. High quality, fast streaming, and a modern interface.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Links</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><Link to="/about" className="hover:text-neon-purple transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-neon-purple transition-colors">Contact</Link></li>
                <li><Link to="/terms" className="hover:text-neon-purple transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-neon-purple transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Genres</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><Link to="/search?q=Action" className="hover:text-neon-purple transition-colors">Action</Link></li>
                <li><Link to="/search?q=Adventure" className="hover:text-neon-purple transition-colors">Adventure</Link></li>
                <li><Link to="/search?q=Comedy" className="hover:text-neon-purple transition-colors">Comedy</Link></li>
                <li><Link to="/search?q=Fantasy" className="hover:text-neon-purple transition-colors">Fantasy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Connect</h4>
              <div className="flex gap-4">
                <a 
                  href="https://github.com/Krish-x90" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-neon-purple hover:text-white transition-all cursor-pointer"
                  aria-label="GitHub"
                >
                  <Github size={20} />
                </a>
                <a 
                  href="https://www.instagram.com/sarodekrish?igsh=bTlmd2lkenh0c2Uz&utm_source=qr" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-neon-purple hover:text-white transition-all cursor-pointer"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a 
                  href="https://www.linkedin.com/in/krish-sarode-70392b356?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-neon-purple hover:text-white transition-all cursor-pointer"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center text-sm text-text-secondary">
            <p>&copy; {new Date().getFullYear()} Potato TV. All Rights are reserved to Krish Sarode.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
