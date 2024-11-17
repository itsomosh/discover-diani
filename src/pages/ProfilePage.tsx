import React from 'react';
import { UserProfile } from '../components/profile/UserProfile';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
        <UserProfile />
      </div>
    </div>
  );
};
