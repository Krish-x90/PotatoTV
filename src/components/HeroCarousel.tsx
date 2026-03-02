import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';
import { Anime } from '../types';

interface HeroCarouselProps {
  featuredAnime: Anime[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ featuredAnime }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredAnime.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [featuredAnime.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredAnime.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredAnime.length) % featuredAnime.length);
  };

  if (!featuredAnime.length) return null;

  return (
    <div className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${featuredAnime[currentIndex].banner})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="absolute inset-0 container mx-auto px-4 flex items-center">
            <div className="max-w-2xl pt-20">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <span className="text-neon-purple font-bold tracking-wider text-sm uppercase mb-2 block">
                  #{currentIndex + 1} Spotlight
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight neon-text">
                  {featuredAnime[currentIndex].title}
                </h1>
                
                <div className="flex items-center gap-4 mb-6 text-sm md:text-base text-text-secondary">
                  <span className="text-green-400 font-bold">{featuredAnime[currentIndex].rating} Match</span>
                  <span>{featuredAnime[currentIndex].year}</span>
                  <span className="border border-white/20 px-2 py-0.5 rounded text-xs">{featuredAnime[currentIndex].status}</span>
                  <span>{featuredAnime[currentIndex].episodes} Episodes</span>
                </div>

                <p className="text-text-secondary line-clamp-3 mb-8 text-sm md:text-lg max-w-xl">
                  {featuredAnime[currentIndex].description}
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link to={`/watch/${featuredAnime[currentIndex].id}`}>
                    <Button size="lg" leftIcon={<Play size={20} fill="currentColor" />}>
                      Watch Now
                    </Button>
                  </Link>
                  <Link to={`/anime/${featuredAnime[currentIndex].id}`}>
                    <Button variant="secondary" size="lg" leftIcon={<Info size={20} />}>
                      More Info
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="absolute bottom-10 right-10 flex gap-2 z-10 hidden md:flex">
        <button 
          onClick={prevSlide}
          className="p-3 rounded-full bg-white/10 hover:bg-neon-purple hover:text-white transition-all backdrop-blur-sm border border-white/10"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={nextSlide}
          className="p-3 rounded-full bg-white/10 hover:bg-neon-purple hover:text-white transition-all backdrop-blur-sm border border-white/10"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
        {featuredAnime.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-8 bg-neon-purple shadow-[0_0_10px_#A020F0]' : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
