import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BusinessCard } from '../components/businesses/BusinessCard';
import { SearchBar } from '../components/SearchBar';
import { dbService } from '../services/database';
import { Business } from '../services/collections';
import { useNavigate } from 'react-router-dom';
import { Filter, SortAsc } from 'lucide-react';

export const BusinessListingPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'reviewCount'>('rating');
  const [filterBy, setFilterBy] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const snapshot = await dbService.getAll('businesses');
        let businessList = snapshot as Business[];

        // Apply sorting
        businessList.sort((a, b) => {
          if (sortBy === 'rating') return b.rating - a.rating;
          return b.reviewCount - a.reviewCount;
        });

        // Apply filters
        if (filterBy.length > 0) {
          businessList = businessList.filter(business => 
            business.amenities.some(amenity => filterBy.includes(amenity))
          );
        }

        setBusinesses(businessList);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [sortBy, filterBy]);

  const handleSearch = async (query: string) => {
    try {
      setLoading(true);
      // Implement your search logic here
      const results = await dbService.search('businesses', query);
      setBusinesses(results as Business[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBusiness = (business: Business) => {
    navigate(`/business/${business.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Discover Diani Businesses
        </h1>
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center">
          <SortAsc className="w-5 h-5 text-gray-500 mr-2" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'rating' | 'reviewCount')}
            className="border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="rating">Rating</option>
            <option value="reviewCount">Review Count</option>
          </select>
        </div>

        <div className="flex items-center">
          <Filter className="w-5 h-5 text-gray-500 mr-2" />
          <select
            multiple
            value={filterBy}
            onChange={(e) => setFilterBy(Array.from(e.target.selectedOptions, option => option.value))}
            className="border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="wifi">WiFi</option>
            <option value="parking">Parking</option>
            <option value="pool">Pool</option>
            <option value="restaurant">Restaurant</option>
            <option value="bar">Bar</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-96 bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {businesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              onView={handleViewBusiness}
            />
          ))}
        </motion.div>
      )}

      {!loading && businesses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No businesses found.</p>
        </div>
      )}
    </div>
  );
};
