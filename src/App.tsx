import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AppRoutes } from './routes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { BusinessRegistrationModal } from './components/BusinessRegistrationModal';
import AISearch from './components/AISearch';
import BusinessRegistrationForm from './components/BusinessRegistration/BusinessRegistrationForm';
import { AuthButton } from './components/auth/AuthButton';

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBusinessModalOpen, setBusinessModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar isScrolled={isScrolled}>
            <div className="ml-auto">
              <AuthButton />
            </div>
          </Navbar>
          <main className="flex-grow">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl font-bold text-center my-8">Discover Diani</h1>
              <AISearch />
            </div>
            <AppRoutes 
              onRegisterClick={() => setBusinessModalOpen(true)} 
            />
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
  );
}

export default App;