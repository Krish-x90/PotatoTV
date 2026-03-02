import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useSpring, useTransform } from 'framer-motion';

export const PageLoader = () => {
  const { pathname } = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Reset loading state on path change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Simulate minimum load time for visual feedback
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent">
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="h-full bg-neon-purple shadow-[0_0_10px_#A020F0]"
      />
    </div>
  );
};
