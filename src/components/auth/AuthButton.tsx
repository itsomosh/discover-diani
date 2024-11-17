import React, { useState } from 'react';
import { User } from 'lucide-react';
import { authService } from '../../services/auth';
import { AuthModal } from './AuthModal';

export const AuthButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  React.useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {user ? (
        <div className="relative group">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-gray-100 transition-colors">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <User className="w-6 h-6" />
            )}
            <span className="text-sm font-medium">{user.displayName || user.email}</span>
          </button>
          <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <button
              onClick={handleSignOut}
              className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
            >
              Sign out
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Sign In
        </button>
      )}

      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
