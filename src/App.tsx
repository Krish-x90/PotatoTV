/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import { Layout } from './layouts/Layout';
import { PageLoader } from './components/ui/PageLoader';
import { HeroSkeleton } from './components/ui/Skeleton';
import { useAuthStore } from './store/useAuthStore';

// Lazy load pages
const Home = React.lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const AnimeDetails = React.lazy(() => import('./pages/AnimeDetails').then(module => ({ default: module.AnimeDetails })));
const Watch = React.lazy(() => import('./pages/Watch').then(module => ({ default: module.Watch })));
const Search = React.lazy(() => import('./pages/Search').then(module => ({ default: module.Search })));
const Login = React.lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Signup = React.lazy(() => import('./pages/Signup').then(module => ({ default: module.Signup })));
const Profile = React.lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/anime/:id" element={<AnimeDetails />} />
        <Route path="/watch/:id" element={<Watch />} />
        <Route path="/search" element={<Search />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <PageLoader />
        <Layout>
          <Suspense fallback={<HeroSkeleton />}>
            <AnimatedRoutes />
          </Suspense>
        </Layout>
      </Router>
    </HelmetProvider>
  );
}
