import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AppRoutes } from './routes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { BusinessRegistrationModal } from './components/BusinessRegistrationModal';
import AISearch from './components/AISearch';
import { AuthButton } from './components/auth/AuthButton';
import ErrorBoundary from './components/ErrorBoundary';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBusinessModalOpen, setBusinessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Simulate initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar isScrolled={isScrolled}>
              <AuthButton />
            </Navbar>
            
            <main className="flex-grow">
              <Suspense fallback={<LoadingSpinner />}>
                <div className="container mx-auto px-4">
                  <h1 className="text-4xl font-bold text-center my-8">Discover Diani</h1>
                  <AISearch />
                </div>
                <AppRoutes />
              </Suspense>
            </main>

            <Footer />
            
            <BusinessRegistrationModal 
              isOpen={isBusinessModalOpen} 
              onClose={() => setBusinessModalOpen(false)} 
            />
          </div>
          <Toaster position="top-right" />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;