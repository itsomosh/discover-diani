import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/database';
import { UserProfile as UserProfileType } from '../../services/collections';
import { Camera, Edit2, Save, X } from 'lucide-react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const userData = await dbService.get('users', user.uid);
        setProfile(userData);
        setDisplayName(userData?.displayName || '');
        setBio(userData?.bio || '');
      }
    };
    fetchProfile();
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || !e.target.files[0]) return;

    try {
      setLoading(true);
      const file = e.target.files[0];
      const storage = getStorage();
      const storageRef = ref(storage, `profile-images/${user.uid}`);
      
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      
      await dbService.update('users', user.uid, { photoURL });
      setProfile(prev => prev ? { ...prev, photoURL } : null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await dbService.update('users', user.uid, {
        displayName,
        bio,
        updatedAt: Date.now()
      });
      setProfile(prev => prev ? { ...prev, displayName, bio } : null);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="relative w-32 h-32 mx-auto mb-6">
        <img
          src={profile.photoURL || 'https://via.placeholder.com/128'}
          alt={profile.displayName || 'Profile'}
          className="w-full h-full rounded-full object-cover"
        />
        <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
          <Camera className="w-5 h-5 text-white" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={loading}
          />
        </label>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Display Name
            </label>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit Profile
              </button>
            )}
          </div>
          {isEditing ? (
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your display name"
            />
          ) : (
            <p className="text-gray-900">{profile.displayName || 'No display name set'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <p className="text-gray-900">{profile.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          {isEditing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Tell us about yourself"
            />
          ) : (
            <p className="text-gray-900">{profile.bio || 'No bio added yet'}</p>
          )}
        </div>

        {isEditing && (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              <Save className="w-5 h-5 mr-1" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {profile.reviews?.length || 0}
            </p>
            <p className="text-sm text-gray-600">Reviews</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {profile.favorites?.length || 0}
            </p>
            <p className="text-sm text-gray-600">Favorites</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {profile.bookings?.length || 0}
            </p>
            <p className="text-sm text-gray-600">Bookings</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
