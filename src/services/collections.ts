import { dbService } from './database';
import { User } from 'firebase/auth';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  BUSINESSES: 'businesses',
  REVIEWS: 'reviews',
  BOOKINGS: 'bookings',
  FAVORITES: 'favorites'
} as const;

// User profile interface
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: number;
  favorites?: string[];
  reviews?: string[];
}

// Business interface
export interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  images: string[];
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
  amenities: string[];
  rating: number;
  reviewCount: number;
  createdAt: number;
  updatedAt: number;
  ownerId: string;
}

// Review interface
export interface Review {
  id: string;
  businessId: string;
  userId: string;
  rating: number;
  text: string;
  images?: string[];
  createdAt: number;
  updatedAt: number;
}

// Booking interface
export interface Booking {
  id: string;
  businessId: string;
  userId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export const collectionsService = {
  // User operations
  async createUserProfile(user: User) {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      createdAt: Date.now()
    };
    return dbService.create(COLLECTIONS.USERS, user.uid, userProfile);
  },

  async getUserProfile(userId: string) {
    return dbService.get(COLLECTIONS.USERS, userId) as Promise<UserProfile | null>;
  },

  // Business operations
  async createBusiness(businessData: Omit<Business, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount'>) {
    const now = Date.now();
    const business: Business = {
      ...businessData,
      id: `business_${now}`,
      createdAt: now,
      updatedAt: now,
      rating: 0,
      reviewCount: 0
    };
    await dbService.create(COLLECTIONS.BUSINESSES, business.id, business);
    return business;
  },

  async getBusiness(businessId: string) {
    return dbService.get(COLLECTIONS.BUSINESSES, businessId) as Promise<Business | null>;
  },

  async getBusinessesByCategory(category: string) {
    return dbService.query(COLLECTIONS.BUSINESSES, 'category', '==', category);
  },

  // Review operations
  async createReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = Date.now();
    const review: Review = {
      ...reviewData,
      id: `review_${now}`,
      createdAt: now,
      updatedAt: now
    };
    await dbService.create(COLLECTIONS.REVIEWS, review.id, review);

    // Update business rating and review count
    const business = await this.getBusiness(review.businessId);
    if (business) {
      const reviews = await this.getBusinessReviews(review.businessId);
      const newRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
      await dbService.update(COLLECTIONS.BUSINESSES, review.businessId, {
        rating: newRating,
        reviewCount: reviews.length
      });
    }

    return review;
  },

  async getBusinessReviews(businessId: string) {
    return dbService.query(COLLECTIONS.REVIEWS, 'businessId', '==', businessId);
  },

  // Booking operations
  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = Date.now();
    const booking: Booking = {
      ...bookingData,
      id: `booking_${now}`,
      createdAt: now,
      updatedAt: now
    };
    await dbService.create(COLLECTIONS.BOOKINGS, booking.id, booking);
    return booking;
  },

  async getUserBookings(userId: string) {
    return dbService.query(COLLECTIONS.BOOKINGS, 'userId', '==', userId);
  },

  async updateBookingStatus(bookingId: string, status: Booking['status']) {
    return dbService.update(COLLECTIONS.BOOKINGS, bookingId, {
      status,
      updatedAt: Date.now()
    });
  }
};
