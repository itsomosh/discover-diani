import React, { useState, useCallback } from 'react';
import { X, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Select from 'react-select';
import toast, { Toaster } from 'react-hot-toast';
import { Button } from './Button';

interface BusinessRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const businessTypes = [
  { value: 'restaurant', label: 'Restaurant & Dining' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'activity', label: 'Activities & Tours' },
  { value: 'retail', label: 'Retail & Shopping' },
  { value: 'wellness', label: 'Wellness & Spa' },
  { value: 'transport', label: 'Transport Services' },
  { value: 'property', label: 'Property & Real Estate' },
  { value: 'other', label: 'Other Services' }
];

const amenities = [
  { value: 'wifi', label: 'Free WiFi' },
  { value: 'parking', label: 'Parking Available' },
  { value: 'ac', label: 'Air Conditioning' },
  { value: 'pool', label: 'Swimming Pool' },
  { value: 'beach', label: 'Beach Access' },
  { value: 'cards', label: 'Card Payment' },
  { value: 'mpesa', label: 'M-PESA' },
  { value: 'delivery', label: 'Delivery Service' }
];

export function BusinessRegistrationModal({ isOpen, onClose }: BusinessRegistrationModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: null,
    description: '',
    amenities: [],
    location: '',
    contactName: '',
    email: '',
    phone: '',
    whatsapp: '',
    website: '',
    instagram: '',
    openingHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '15:00', closed: false },
      sunday: { open: '10:00', close: '15:00', closed: true }
    },
    images: []
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 5)
    }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 5,
    maxSize: 5242880 // 5MB
  });

  const generateDescription = async () => {
    if (!formData.businessName || !formData.businessType) {
      toast.error('Please fill in business name and type first');
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_XAI_API_KEY}`
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an expert in writing engaging business descriptions for tourism and hospitality businesses.'
            },
            {
              role: 'user',
              content: `Write a compelling 2-3 sentence description for a ${formData.businessType?.label} in Diani Beach, Kenya called "${formData.businessName}". Make it SEO-friendly and highlight the unique aspects of Diani Beach.`
            }
          ],
          model: 'grok-beta',
          temperature: 0.7
        })
      });

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        description: data.choices[0].message.content
      }));
      toast.success('Description generated successfully!');
    } catch (error) {
      toast.error('Failed to generate description. Please try again.');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'images') {
        value.forEach((image: any, index: number) => {
          formDataToSend.append(`image${index + 1}`, image.file);
        });
      } else if (key === 'businessType') {
        formDataToSend.append(key, value.value);
      } else if (key === 'amenities') {
        formDataToSend.append(key, JSON.stringify(value.map((a: any) => a.value)));
      } else if (key === 'openingHours') {
        formDataToSend.append(key, JSON.stringify(value));
      } else {
        formDataToSend.append(key, value);
      }
    });

    try {
      const response = await fetch('https://hook.eu2.make.com/18xdj9p2diuegsdf197w40k1yt2pkjdu', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        toast.success('Business registered successfully!');
        setTimeout(onClose, 2000);
      } else {
        throw new Error('Failed to register business');
      }
    } catch (error) {
      toast.error('Failed to register business. Please try again.');
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info' },
    { number: 2, title: 'Contact Details' },
    { number: 3, title: 'Business Hours' },
    { number: 4, title: 'Photos & Finish' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Toaster position="top-right" />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-4xl p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold">Register Your Business</h2>
          <div className="mt-4 flex justify-between">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex items-center ${
                  currentStep === step.number
                    ? 'text-primary'
                    : currentStep > step.number
                    ? 'text-green-500'
                    : 'text-gray-400'
                }`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${currentStep === step.number ? 'bg-primary text-white' :
                    currentStep > step.number ? 'bg-green-500 text-white' : 'bg-gray-200'}
                `}>
                  {currentStep > step.number ? <CheckCircle2 className="h-5 w-5" /> : step.number}
                </div>
                <span className="ml-2 text-sm font-medium">{step.title}</span>
                {step.number < steps.length && (
                  <div className={`w-full h-1 mx-2 ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type *
                </label>
                <Select
                  value={formData.businessType}
                  onChange={(selected) => setFormData({ ...formData, businessType: selected })}
                  options={businessTypes}
                  className="react-select"
                  classNamePrefix="react-select"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Business Description *
                  </label>
                  <button
                    type="button"
                    onClick={generateDescription}
                    className="text-sm text-primary hover:text-primary/80 flex items-center"
                    disabled={isGeneratingDescription}
                  >
                    {isGeneratingDescription ? (
                      <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Generating...</>
                    ) : (
                      'Generate with AI'
                    )}
                  </button>
                </div>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amenities
                </label>
                <Select
                  isMulti
                  value={formData.amenities}
                  onChange={(selected) => setFormData({ ...formData, amenities: selected })}
                  options={amenities}
                  className="react-select"
                  classNamePrefix="react-select"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location in Diani *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              {Object.entries(formData.openingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center space-x-4">
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700">
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </label>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!hours.closed}
                        onChange={(e) => setFormData({
                          ...formData,
                          openingHours: {
                            ...formData.openingHours,
                            [day]: { ...hours, closed: !e.target.checked }
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                    {!hours.closed && (
                      <>
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => setFormData({
                            ...formData,
                            openingHours: {
                              ...formData.openingHours,
                              [day]: { ...hours, open: e.target.value }
                            }
                          })}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => setFormData({
                            ...formData,
                            openingHours: {
                              ...formData.openingHours,
                              [day]: { ...hours, close: e.target.value }
                            }
                          })}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Photos (Max 5)
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600">
                    Drag & drop images here, or click to select files
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Maximum 5 images, up to 5MB each
                  </p>
                </div>
                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                    {formData.images.map((image: any, index: number) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            images: formData.images.filter((_, i) => i !== index)
                          })}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Previous
              </Button>
            )}
            {currentStep < steps.length ? (
              <Button
                type="button"
                variant="primary"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" variant="primary">
                Submit Registration
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}