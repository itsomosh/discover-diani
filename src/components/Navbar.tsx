import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass } from 'lucide-react';

interface NavbarProps {
  isScrolled: boolean;
  children?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ isScrolled, children }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Features', path: '/features' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <Compass className="h-8 w-8 text-primary transform transition-transform group-hover:rotate-45" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Discover Diani
            </span>
          </Link>
          <div className="hidden md:flex space-x-12">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative text-gray-900 font-medium group ${
                  location.pathname === item.path ? 'text-primary' : ''
                }`}
              >
                <span className="relative z-10">{item.name}</span>
                <div className={`absolute inset-x-0 h-0.5 bg-primary ${
                  location.pathname === item.path ? 'scale-x-100' : 'scale-x-0'
                } group-hover:scale-x-100 transition-transform origin-left bottom-0`} />
              </Link>
            ))}
            {children}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;