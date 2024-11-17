import React from 'react';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { HowItWorks } from '../components/HowItWorks';
import { EmailSignup } from '../components/EmailSignup';
import { BusinessRegistration } from '../components/BusinessRegistration';

interface HomeProps {
  onRegisterClick: () => void;
}

export function Home({ onRegisterClick }: HomeProps) {
  return (
    <main>
      <Hero />
      <Features />
      <HowItWorks />
      <EmailSignup />
      <BusinessRegistration onRegisterClick={onRegisterClick} />
    </main>
  );
}