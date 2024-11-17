import { useState } from 'react';
import { Search } from 'lucide-react';

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setResponse('');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResponse('Here are some results for your search...');
    } catch (error: unknown) {
      console.error('Search error:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="glass-effect rounded-2xl p-4 shadow-xl transition-transform hover:scale-[1.02]">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="What would you like to discover in Diani?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border-none focus:ring-2 focus:ring-primary/20 rounded-xl placeholder-gray-400"
              aria-label="Search input"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl transition-transform hover:scale-105 active:scale-95"
            aria-label="Search button"
            disabled={isLoading}
          >
            <Search className="w-5 h-5" aria-hidden="true" />
            <span>{isLoading ? 'Searching...' : 'Search'}</span>
          </button>
        </div>
      </div>
      
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl z-10"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Searching Diani...</span>
          </div>
        </div>
      )}
      
      {response && (
        <div
          className="glass-effect mt-4 rounded-2xl divide-y divide-gray-100"
          role="region"
          aria-label="Search results"
        >
          <div className="p-4 hover:bg-primary/5 transition-colors cursor-pointer">
            <h3 className="font-medium mb-1">Result</h3>
            <p className="text-sm text-gray-600">{response}</p>
          </div>
        </div>
      )}
    </div>
  );
}