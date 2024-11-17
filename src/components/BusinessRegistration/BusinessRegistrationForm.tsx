import React, { useState } from 'react';
import { Business, businessService } from '../../services/business';
import LocationPicker from './LocationPicker';

interface Step {
    id: number;
    title: string;
    isCompleted: boolean;
}

const BUSINESS_CATEGORIES = [
    'Accommodation',
    'Restaurants & Dining',
    'Activities & Tours',
    'Transportation',
    'Shopping',
    'Wellness & Spa',
    'Nightlife',
    'Other Services'
];

const PRICE_RANGES = [
    'Budget',
    'Mid-Range',
    'Luxury',
    'Premium'
];

export const BusinessRegistrationForm: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<Partial<Business>>({
        businessHours: [],
        amenities: [],
        subcategories: [],
        images: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const steps: Step[] = [
        { id: 1, title: 'Basic Information', isCompleted: false },
        { id: 2, title: 'Location & Hours', isCompleted: false },
        { id: 3, title: 'Features & Amenities', isCompleted: false },
        { id: 4, title: 'Identity Verification', isCompleted: false },
        { id: 5, title: 'Review & Submit', isCompleted: false }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setLoading(true);
        try {
            // TODO: Implement actual file upload logic
            const uploadedUrls = ['mock_url']; // Mock implementation
            
            if (e.target.name === 'idDocument') {
                setFormData(prev => ({
                    ...prev,
                    idDocument: {
                        type: 'nationalId',
                        number: '',
                        verificationStatus: 'pending',
                        documentUrl: uploadedUrls[0]
                    }
                }));
            } else if (e.target.name === 'images') {
                setFormData(prev => ({
                    ...prev,
                    images: [...(prev.images || []), ...uploadedUrls]
                }));
            }
        } catch (err) {
            setError('Failed to upload file');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Verify ID document
            if (formData.idDocument?.documentUrl && formData.fullName) {
                const verificationResult = await businessService.verifyIdentityDocument(
                    formData.idDocument.documentUrl,
                    formData.fullName
                );

                if (!verificationResult.isValid) {
                    throw new Error('ID verification failed: ' + verificationResult.error);
                }
            }

            // Save business data
            const savedBusiness = await businessService.saveBusiness(formData);
            console.log('Business registered successfully:', savedBusiness);
            
            // TODO: Show success message and redirect
        } catch (err) {
            setError('Failed to register business');
        } finally {
            setLoading(false);
        }
    };

    const renderBasicInfo = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Full Name (as per ID/Passport)</label>
                <input
                    type="text"
                    name="fullName"
                    value={formData.fullName || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Business Name</label>
                <input
                    type="text"
                    name="businessName"
                    value={formData.businessName || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                    name="category"
                    value={formData.category || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                >
                    <option value="">Select a category</option>
                    {BUSINESS_CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                />
            </div>
        </div>
    );

    const renderLocationHours = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-lg font-medium text-gray-700 mb-4">Select Business Location</label>
                <LocationPicker
                    onLocationSelect={(location) => {
                        setFormData(prev => ({
                            ...prev,
                            location: {
                                latitude: location.lat,
                                longitude: location.lng,
                                address: location.address
                            }
                        }));
                    }}
                    initialLocation={formData.location ? {
                        lat: formData.location.latitude,
                        lng: formData.location.longitude,
                        address: formData.location.address
                    } : undefined}
                />
            </div>

            <div className="mt-6">
                <label className="block text-lg font-medium text-gray-700 mb-4">Business Hours</label>
                <div className="grid grid-cols-1 gap-4">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <div key={day} className="flex items-center space-x-4">
                            <span className="w-24 text-sm font-medium text-gray-700">{day}</span>
                            <input
                                type="time"
                                name={`${day.toLowerCase()}-open`}
                                onChange={(e) => {
                                    const hours = [...(formData.businessHours || [])];
                                    const dayIndex = hours.findIndex(h => h.day === day);
                                    if (dayIndex >= 0) {
                                        hours[dayIndex] = { ...hours[dayIndex], open: e.target.value };
                                    } else {
                                        hours.push({ day, open: e.target.value, close: '' });
                                    }
                                    setFormData(prev => ({ ...prev, businessHours: hours }));
                                }}
                                className="px-2 py-1 border rounded-md"
                            />
                            <span className="text-sm text-gray-500">to</span>
                            <input
                                type="time"
                                name={`${day.toLowerCase()}-close`}
                                onChange={(e) => {
                                    const hours = [...(formData.businessHours || [])];
                                    const dayIndex = hours.findIndex(h => h.day === day);
                                    if (dayIndex >= 0) {
                                        hours[dayIndex] = { ...hours[dayIndex], close: e.target.value };
                                    } else {
                                        hours.push({ day, open: '', close: e.target.value });
                                    }
                                    setFormData(prev => ({ ...prev, businessHours: hours }));
                                }}
                                className="px-2 py-1 border rounded-md"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderFeaturesAmenities = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Price Range</label>
                <select
                    name="priceRange"
                    value={formData.priceRange || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                >
                    <option value="">Select price range</option>
                    {PRICE_RANGES.map(range => (
                        <option key={range} value={range}>{range}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Business Images</label>
                <input
                    type="file"
                    name="images"
                    onChange={handleFileUpload}
                    multiple
                    accept="image/*"
                    className="mt-1 block w-full"
                />
            </div>
            {/* TODO: Add amenities checkboxes */}
        </div>
    );

    const renderIdentityVerification = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">ID/Passport Upload</label>
                <input
                    type="file"
                    name="idDocument"
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="mt-1 block w-full"
                    required
                />
                <p className="mt-2 text-sm text-gray-500">
                    Please upload a clear photo of your ID or passport. This will be used to verify your identity.
                </p>
            </div>
        </div>
    );

    const renderReview = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Review Your Information</h3>
            <div className="bg-gray-50 p-4 rounded-md">
                <dl className="space-y-2">
                    <dt className="text-sm font-medium text-gray-500">Business Name</dt>
                    <dd className="text-sm text-gray-900">{formData.businessName}</dd>
                    {/* Add more review fields */}
                </dl>
            </div>
        </div>
    );

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return renderBasicInfo();
            case 2:
                return renderLocationHours();
            case 3:
                return renderFeaturesAmenities();
            case 4:
                return renderIdentityVerification();
            case 5:
                return renderReview();
            default:
                return null;
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    {steps.map(step => (
                        <div
                            key={step.id}
                            className={`flex items-center ${
                                step.id === currentStep
                                    ? 'text-blue-600'
                                    : step.isCompleted
                                    ? 'text-green-600'
                                    : 'text-gray-400'
                            }`}
                        >
                            <span className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-current">
                                {step.id}
                            </span>
                            <span className="ml-2 text-sm hidden sm:inline">{step.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {renderCurrentStep()}

                {error && (
                    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <div className="flex justify-between">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Previous
                        </button>
                    )}
                    {currentStep < steps.length ? (
                        <button
                            type="button"
                            onClick={() => setCurrentStep(prev => prev + 1)}
                            className="ml-3 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading}
                            className="ml-3 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                        >
                            {loading ? 'Submitting...' : 'Submit'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default BusinessRegistrationForm;
