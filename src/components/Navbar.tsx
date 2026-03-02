import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, User, Menu, X, LogOut, Play, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAuthStore } from '../store/useAuthStore';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/80 backdrop-blur-lg border-b border-white/5 py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 z-50">
          <div className="w-8 h-8 bg-neon-purple rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(160,32,240,0.5)]">
            <Play size={16} fill="white" className="text-white ml-0.5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-text-primary">
            Potato<span className="text-neon-purple">TV</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium">Home</Link>
          <Link to="/search?sort=popular" className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium">Popular</Link>
          <Link to="/search?sort=trending" className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium">Trending</Link>
          <Link to="/search?genre=Action" className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium">Genres</Link>
        </div>

        {/* Search & Profile */}
        <div className="hidden md:flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative w-64">
            <Input
              placeholder="Search anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
              className="bg-secondary-dark/50 border-white/5 focus:bg-secondary-dark text-text-primary placeholder:text-text-secondary"
            />
          </form>

          <button 
            onClick={toggleTheme} 
            className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-full hover:bg-white/5"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button className="relative p-2 text-text-secondary hover:text-text-primary transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-purple rounded-full"></span>
              </button>
              <div className="relative group">
                <Link to="/profile">
                  <img
                    src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                    alt="Avatar"
                    className="w-9 h-9 rounded-full border border-white/10 hover:border-neon-purple transition-colors cursor-pointer"
                  />
                </Link>
                <div className="absolute right-0 mt-2 w-48 bg-secondary-dark border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                  <div className="p-3 border-b border-white/5">
                    <p className="text-text-primary font-medium truncate">{user?.username}</p>
                    <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                  </div>
                  <div className="p-1">
                    <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg">
                      <User size={16} /> Profile
                    </Link>
                    <button 
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <button 
            onClick={toggleTheme} 
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            className="text-text-primary p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-secondary-dark border-b border-white/5 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <form onSubmit={handleSearch}>
                <Input
                  placeholder="Search anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search size={16} />}
                  className="bg-background/50 text-text-primary"
                />
              </form>
              
              <div className="flex flex-col gap-2">
                <Link to="/" className="text-text-primary py-2 border-b border-white/5">Home</Link>
                <Link to="/search?sort=popular" className="text-text-secondary py-2 border-b border-white/5">Popular</Link>
                <Link to="/search?sort=trending" className="text-text-secondary py-2 border-b border-white/5">Trending</Link>
                <Link to="/search?genre=Action" className="text-text-secondary py-2 border-b border-white/5">Genres</Link>
              </div>

              {isAuthenticated ? (
                <div className="flex flex-col gap-2 mt-2">
                  <Link to="/profile" className="flex items-center gap-3 text-text-primary py-2">
                    <img
                      src={user?.avatar}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    <span>My Profile</span>
                  </Link>
                  <button onClick={logout} className="flex items-center gap-2 text-red-400 py-2">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 mt-2">
                  <Link to="/login" className="flex-1">
                    <Button variant="secondary" className="w-full">Login</Button>
                  </Link>
                  <Link to="/signup" className="flex-1">
                    <Button variant="primary" className="w-full">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
