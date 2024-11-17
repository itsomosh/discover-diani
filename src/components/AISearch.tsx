import React, { useState, useRef, useCallback, useEffect } from 'react';
import { aiService } from '../services/ai';
import { analyticsService } from '../services/analytics';
import debounce from 'lodash/debounce';

const DEBOUNCE_DELAY = 1000; // 1 second

export const AISearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [source, setSource] = useState<'grok' | 'gemini' | 'whisper' | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const [searchCount, setSearchCount] = useState(0);
    const MAX_SEARCHES_PER_MINUTE = 10;
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        // Track initial page load performance
        analyticsService.trackPerformance();
    }, []);

    const exampleQueries = [
        "What are the best beaches in Diani?",
        "Find restaurants with ocean view",
        "Water sports activities near me",
        "Best time to visit Diani Beach"
    ];

    const checkRateLimit = useCallback(() => {
        if (searchCount >= MAX_SEARCHES_PER_MINUTE) {
            throw new Error(`Please wait a moment. Maximum ${MAX_SEARCHES_PER_MINUTE} searches per minute.`);
        }
        setSearchCount(prev => prev + 1);
        setTimeout(() => setSearchCount(prev => Math.max(0, prev - 1)), 60000);
    }, [searchCount]);

    const handleTextSearch = async () => {
        if (!query.trim()) return;
        
        try {
            checkRateLimit();
            setIsLoading(true);
            setError('');
            startTimeRef.current = Date.now();
            
            const result = await aiService.query(query);
            const responseTime = Date.now() - startTimeRef.current;

            analyticsService.trackSearch({
                query,
                searchType: 'text',
                source: result.source || null,
                successful: !result.error,
                responseTime,
                errorMessage: result.error
            });

            if (result.error) {
                setError(result.error);
                analyticsService.trackError(new Error(result.error), 'Text Search');
            } else {
                setResponse(result.text || '');
                setSource(result.source || null);
                
                // Track successful search engagement
                analyticsService.trackUserEngagement({
                    eventName: 'Search Completed',
                    properties: {
                        queryLength: query.length,
                        responseLength: result.text?.length || 0,
                        searchType: 'text'
                    }
                });
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to process your request';
            setError(errorMessage);
            analyticsService.trackError(err instanceof Error ? err : new Error(errorMessage), 'Text Search');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            checkRateLimit();
            setIsLoading(true);
            setError('');
            startTimeRef.current = Date.now();

            if (file.size > 5 * 1024 * 1024) {
                throw new Error('Image size should be less than 5MB');
            }
            if (!file.type.startsWith('image/')) {
                throw new Error('Please upload an image file');
            }

            const imageUrl = URL.createObjectURL(file);
            const result = await aiService.analyzeImage(imageUrl);
            const responseTime = Date.now() - startTimeRef.current;

            analyticsService.trackSearch({
                query: `Image: ${file.name}`,
                searchType: 'image',
                source: result.source || null,
                successful: !result.error,
                responseTime,
                errorMessage: result.error
            });
            
            if (result.error) {
                setError(result.error);
                analyticsService.trackError(new Error(result.error), 'Image Search');
            } else {
                setResponse(result.text || '');
                setSource(result.source || null);

                analyticsService.trackUserEngagement({
                    eventName: 'Image Analysis Completed',
                    properties: {
                        fileSize: file.size,
                        fileType: file.type,
                        responseLength: result.text?.length || 0
                    }
                });
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image';
            setError(errorMessage);
            analyticsService.trackError(err instanceof Error ? err : new Error(errorMessage), 'Image Search');
        } finally {
            setIsLoading(false);
        }
    };

    const debouncedTextSearch = useCallback(
        debounce(handleTextSearch, DEBOUNCE_DELAY),
        []
    );

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                chunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
                setIsLoading(true);
                
                try {
                    const result = await aiService.transcribeAudio(audioBlob);
                    if (result.error) {
                        setError(result.error);
                    } else {
                        setQuery(result.text || '');
                        // Automatically search with transcribed text
                        const searchResult = await aiService.query(result.text || '');
                        setResponse(searchResult.text || '');
                    }
                } catch (err) {
                    setError('Failed to process audio');
                } finally {
                    setIsLoading(false);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            setError('Failed to start recording');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        analyticsService.trackSuggestionUsage(suggestion, true);
        handleTextSearch();
    };

    const handleResponseInteraction = (action: 'copy' | 'share') => {
        if (response) {
            if (action === 'copy') {
                navigator.clipboard.writeText(response);
            } else if (action === 'share') {
                // Implement share functionality
                const shareData = {
                    title: 'Discover Diani Search Result',
                    text: response,
                    url: window.location.href
                };
                if (navigator.share) {
                    navigator.share(shareData);
                }
            }
            analyticsService.trackResultInteraction(action, query);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-4 text-blue-900">Discover Diani AI Search</h1>
                <p className="text-gray-600 mb-4">Ask anything about Diani Beach - from restaurants to activities, we've got you covered!</p>
                
                {searchCount > 0 && (
                    <div className="mb-4 text-sm text-gray-500">
                        Searches remaining: {MAX_SEARCHES_PER_MINUTE - searchCount}/{MAX_SEARCHES_PER_MINUTE} per minute
                    </div>
                )}

                <div className="flex gap-4 mb-4">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            if (e.target.value.trim()) {
                                debouncedTextSearch();
                            }
                        }}
                        placeholder="Ask anything about Diani Beach..."
                        className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleTextSearch}
                        disabled={isLoading || !query.trim()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    {exampleQueries.map((q, index) => (
                        <button
                            key={index}
                            onClick={() => handleSuggestionClick(q)}
                            className="text-left p-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {"🔍 \"" + q + "\""}
                        </button>
                    ))}
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        {"📷 Upload Image"}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                    />

                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`flex-1 px-6 py-3 ${
                            isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
                        } text-white rounded-lg transition-colors`}
                    >
                        {isRecording ? '⏹️ Stop Recording' : '🎤 Start Voice Search'}
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {"⚠️ " + error}
                </div>
            )}

            {response && (
                <div className="bg-white shadow-lg rounded-lg p-6 animate-fade-in">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-blue-900">Response:</h3>
                        {source && (
                            <span className="text-sm text-gray-500">
                                Powered by {source.charAt(0).toUpperCase() + source.slice(1)}
                            </span>
                        )}
                    </div>
                    <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{response}</p>
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => handleResponseInteraction('copy')}
                            className="text-sm text-blue-600 hover:text-blue-700"
                        >
                            📋 Copy
                        </button>
                        {navigator.share && (
                            <button
                                onClick={() => handleResponseInteraction('share')}
                                className="text-sm text-blue-600 hover:text-blue-700"
                            >
                                🔗 Share
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AISearch;
