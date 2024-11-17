import React from 'react';
import { Compass, Facebook, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center mb-6 group">
            <Compass className="h-8 w-8 text-primary transform transition-transform group-hover:rotate-45" />
            <span className="ml-2 text-xl font-bold">Discover Diani</span>
          </div>
          <p className="text-gray-400 mb-8 max-w-md">
            Connecting travelers with authentic Diani experiences, one adventure at a time. Join us in celebrating the magic of Kenya's coastal paradise.
          </p>
          <div className="flex space-x-6">
            {[
              { icon: Facebook, label: 'Facebook', url: 'https://facebook.com/ashafromdiani' },
              { icon: Twitter, label: 'Twitter', url: 'https://twitter.com/ashafromdiani' },
              { icon: Instagram, label: 'Instagram', url: 'https://instagram.com/ashafromdiani' }
            ].map(({ icon: Icon, label, url }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                aria-label={label}
              >
                <Icon className="h-6 w-6" />
              </a>
            ))}
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-gray-400">
            <p> {new Date().getFullYear()} Discover Diani. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}