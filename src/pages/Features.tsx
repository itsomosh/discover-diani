import React from 'react';
import { Features as FeaturesSection } from '../components/Features';
import { EmailSignup } from '../components/EmailSignup';

export function Features() {
  return (
    <main className="pt-20">
      <div className="bg-gradient-to-b from-primary/10 to-transparent py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold text-center mb-8">Features</h1>
          <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto">
            Discover everything Diani Beach has to offer with our comprehensive platform.
          </p>
        </div>
      </div>
      <FeaturesSection />
      <EmailSignup />
    </main>
  );
}