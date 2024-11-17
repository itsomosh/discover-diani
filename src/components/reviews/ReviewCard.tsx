import React from 'react';
import { Star, MoreVertical, ThumbsUp, Flag } from 'lucide-react';
import { Review } from '../../services/collections';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/database';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface ReviewCardProps {
  review: Review;
  onDelete?: (reviewId: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onDelete }) => {
  const { user } = useAuth();
  const [showOptions, setShowOptions] = React.useState(false);
  const [userData, setUserData] = React.useState<any>(null);
  const [likes, setLikes] = React.useState<string[]>([]);

  React.useEffect(() => {
    const fetchUserData = async () => {
      const data = await dbService.get('users', review.userId);
      setUserData(data);
    };
    fetchUserData();
  }, [review.userId]);

  React.useEffect(() => {
    const fetchLikes = async () => {
      const reviewDoc = await dbService.get('reviews', review.id);
      setLikes(reviewDoc?.likes || []);
    };
    fetchLikes();
  }, [review.id]);

  const handleLike = async () => {
    if (!user) return;
    
    const newLikes = likes.includes(user.uid)
      ? likes.filter(id => id !== user.uid)
      : [...likes, user.uid];
    
    await dbService.update('reviews', review.id, { likes: newLikes });
    setLikes(newLikes);
  };

  const handleDelete = async () => {
    if (onDelete && (user?.uid === review.userId)) {
      await dbService.delete('reviews', review.id);
      onDelete(review.id);
    }
  };

  const handleReport = async () => {
    if (!user) return;
    await dbService.create('reports', `report_${Date.now()}`, {
      userId: user.uid,
      reviewId: review.id,
      createdAt: Date.now(),
      status: 'pending'
    });
    setShowOptions(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm p-4 mb-4"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <img
            src={userData?.photoURL || 'https://via.placeholder.com/40'}
            alt={userData?.displayName || 'User'}
            className="w-10 h-10 rounded-full"
          />
          <div className="ml-3">
            <h4 className="font-medium text-gray-900">
              {userData?.displayName || 'Anonymous User'}
            </h4>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-500">
                {format(review.createdAt, 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>

          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10"
              >
                {user?.uid === review.userId && (
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete review
                  </button>
                )}
                <button
                  onClick={handleReport}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Report review
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="mt-3 text-gray-600">{review.text}</p>

      {review.images && review.images.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="w-24 h-24 object-cover rounded-md"
            />
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 text-sm ${
            user && likes.includes(user.uid)
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-blue-600'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span>{likes.length}</span>
        </button>
      </div>
    </motion.div>
  );
};
