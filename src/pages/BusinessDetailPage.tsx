import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Business, Review } from '../services/collections';
import { dbService } from '../services/database';
import { ReviewCard } from '../components/reviews/ReviewCard';
import { useAuth } from '../contexts/AuthContext';
import { Star, MapPin, Phone, Globe, Mail, ChevronLeft } from 'lucide-react';

export const BusinessDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    text: '',
    images: [] as string[]
  });

  useEffect(() => {
    const fetchBusinessAndReviews = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const businessData = await dbService.get('businesses', id);
        setBusiness(businessData as Business);

        const reviewsData = await dbService.query('reviews', 'businessId', '==', id);
        setReviews(reviewsData as Review[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessAndReviews();
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !business) return;

    try {
      const review: Partial<Review> = {
        businessId: business.id,
        userId: user.uid,
        rating: newReview.rating,
        text: newReview.text,
        images: newReview.images,
        createdAt: Date.now(),
        likes: []
      };

      const reviewId = await dbService.create('reviews', undefined, review);
      const newReviewWithId = { ...review, id: reviewId } as Review;
      
      setReviews(prev => [newReviewWithId, ...prev]);
      setShowReviewForm(false);
      setNewReview({ rating: 5, text: '', images: [] });

      // Update business rating and review count
      const newRating = (business.rating * business.reviewCount + review.rating) / (business.reviewCount + 1);
      await dbService.update('businesses', business.id, {
        rating: newRating,
        reviewCount: business.reviewCount + 1
      });
      setBusiness(prev => prev ? {
        ...prev,
        rating: newRating,
        reviewCount: prev.reviewCount + 1
      } : null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!business) return;

    try {
      await dbService.delete('reviews', reviewId);
      setReviews(prev => prev.filter(review => review.id !== reviewId));

      // Update business rating and review count
      const remainingReviews = reviews.filter(review => review.id !== reviewId);
      const newRating = remainingReviews.length > 0
        ? remainingReviews.reduce((sum, review) => sum + review.rating, 0) / remainingReviews.length
        : 0;
      
      await dbService.update('businesses', business.id, {
        rating: newRating,
        reviewCount: business.reviewCount - 1
      });
      setBusiness(prev => prev ? {
        ...prev,
        rating: newRating,
        reviewCount: prev.reviewCount - 1
      } : null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-8" />
          <div className="h-8 bg-gray-200 w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 w-2/3 mb-8" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back to listings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative h-96 rounded-lg overflow-hidden mb-6">
            <img
              src={business.images[0]}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {business.name}
                </h1>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-gray-600">
                    {business.rating.toFixed(1)} ({business.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-6">{business.description}</p>

            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{business.location.address}</span>
              </div>
              {business.contactInfo.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="w-5 h-5 mr-2" />
                  <span>{business.contactInfo.phone}</span>
                </div>
              )}
              {business.contactInfo.email && (
                <div className="flex items-center text-gray-600">
                  <Mail className="w-5 h-5 mr-2" />
                  <span>{business.contactInfo.email}</span>
                </div>
              )}
              {business.contactInfo.website && (
                <div className="flex items-center text-gray-600">
                  <Globe className="w-5 h-5 mr-2" />
                  <a
                    href={business.contactInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {business.contactInfo.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
              {user && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Write a Review
                </button>
              )}
            </div>

            {showReviewForm && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 bg-gray-50 rounded-lg"
                onSubmit={handleSubmitReview}
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNewReview(prev => ({ ...prev, rating: i + 1 }))}
                        className="p-1"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            i < newReview.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review
                  </label>
                  <textarea
                    value={newReview.text}
                    onChange={(e) => setNewReview(prev => ({ ...prev, text: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Share your experience..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Submit Review
                  </button>
                </div>
              </motion.form>
            )}

            <div className="space-y-6">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onDelete={handleDeleteReview}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Amenities
              </h3>
              <div className="space-y-2">
                {business.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center text-gray-600"
                  >
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2" />
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            {business.location.coordinates && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Location
                </h3>
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                  {/* Add your map component here */}
                  <div className="bg-gray-200 w-full h-full" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
