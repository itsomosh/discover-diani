import React from 'react';
import { Star, MapPin, Phone, Globe, Mail, Heart } from 'lucide-react';
import { Business } from '../../services/collections';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/database';
import { motion } from 'framer-motion';

interface BusinessCardProps {
  business: Business;
  onView: (business: Business) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ business, onView }) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = React.useState(false);
  
  React.useEffect(() => {
    const checkFavorite = async () => {
      if (user) {
        const userDoc = await dbService.get('users', user.uid);
        setIsFavorite(userDoc?.favorites?.includes(business.id) || false);
      }
    };
    checkFavorite();
  }, [user, business.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    const userRef = `users/${user.uid}`;
    const userDoc = await dbService.get('users', user.uid);
    const favorites = userDoc?.favorites || [];

    if (isFavorite) {
      await dbService.update('users', user.uid, {
        favorites: favorites.filter((id: string) => id !== business.id)
      });
    } else {
      await dbService.update('users', user.uid, {
        favorites: [...favorites, business.id]
      });
    }
    setIsFavorite(!isFavorite);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
      onClick={() => onView(business)}
    >
      <div className="relative h-48">
        <img
          src={business.images[0]}
          alt={business.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={toggleFavorite}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{business.name}</h3>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm text-gray-600">
              {business.rating.toFixed(1)} ({business.reviewCount})
            </span>
          </div>
        </div>

        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{business.description}</p>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="line-clamp-1">{business.location.address}</span>
          </div>

          {business.contactInfo.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              <span>{business.contactInfo.phone}</span>
            </div>
          )}

          {business.contactInfo.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2" />
              <span className="line-clamp-1">{business.contactInfo.email}</span>
            </div>
          )}

          {business.contactInfo.website && (
            <div className="flex items-center text-sm text-gray-600">
              <Globe className="w-4 h-4 mr-2" />
              <span className="line-clamp-1">{business.contactInfo.website}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {business.amenities.slice(0, 3).map((amenity) => (
            <span
              key={amenity}
              className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full"
            >
              {amenity}
            </span>
          ))}
          {business.amenities.length > 3 && (
            <span className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded-full">
              +{business.amenities.length - 3} more
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
