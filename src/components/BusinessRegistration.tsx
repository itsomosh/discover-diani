import React from 'react';
import { Button } from './Button';

interface BusinessRegistrationProps {
  onRegisterClick?: () => void;
}

export function BusinessRegistration({ onRegisterClick }: BusinessRegistrationProps) {
  return (
    <section className="py-24 bg-gradient-to-br from-primary to-accent text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold mb-4">Own a Business in Diani Beach?</h2>
        <p className="text-xl mb-8 text-white/90">
          List your business on Discover Diani and reach a wider audience. 
          Get 3 months free when you sign up now!
        </p>
        <Button variant="outline" size="lg" onClick={onRegisterClick}>
          Register Your Business
        </Button>
      </div>
    </section>
  );
}