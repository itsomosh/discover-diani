import React from 'react';
import { HowItWorks as HowItWorksSection } from '../components/HowItWorks';
import { BusinessRegistration } from '../components/BusinessRegistration';

interface HowItWorksProps {
  onRegisterClick: () => void;
}

export function HowItWorks({ onRegisterClick }: HowItWorksProps) {
  return (
    <main className="pt-20">
      <div className="bg-gradient-to-b from-accent/10 to-transparent py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold text-center mb-8">How It Works</h1>
          <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto">
            Learn how Discover Diani makes finding and listing services effortless.
          </p>
        </div>
      </div>
      <HowItWorksSection />
      <BusinessRegistration onRegisterClick={onRegisterClick} />
    </main>
  );
}