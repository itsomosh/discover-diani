import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Features } from './pages/Features';
import { HowItWorks } from './pages/HowItWorks';
import { Contact } from './pages/Contact';
import { Footer } from './components/Footer';
import { BusinessRegistrationModal } from './components/BusinessRegistrationModal';
import AISearch from './components/AISearch';
import BusinessRegistrationForm from './components/BusinessRegistration/BusinessRegistrationForm';
import { AuthProvider } from './contexts/AuthContext';
import { AuthButton } from './components/auth/AuthButton';
import { BusinessListingPage } from './pages/BusinessListingPage';
import { BusinessDetailPage } from './pages/BusinessDetailPage';
import { ProfilePage } from './pages/ProfilePage';

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
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar isScrolled={isScrolled}>
            <div className="ml-auto">
              <AuthButton />
            </div>
          </Navbar>
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center my-8">Discover Diani</h1>
            <AISearch />
          </div>
          <Routes>
            <Route path="/" element={<Home onRegisterClick={() => setBusinessModalOpen(true)} />} />
            <Route path="/features" element={<Features />} />
            <Route path="/how-it-works" element={<HowItWorks onRegisterClick={() => setBusinessModalOpen(true)} />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/register-business" element={<BusinessRegistrationForm />} />
            <Route path="/business-listing" element={<BusinessListingPage />} />
            <Route path="/business/:id" element={<BusinessDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
          <Footer />
          <BusinessRegistrationModal 
            isOpen={isBusinessModalOpen} 
            onClose={() => setBusinessModalOpen(false)} 
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;