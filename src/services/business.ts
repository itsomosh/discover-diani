import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

const ai = new OpenAI({
    apiKey: import.meta.env.VITE_GROK_API_KEY,
    baseURL: 'https://api.x.ai/v1',
});

const gemini = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const geminiVisionModel = gemini.getGenerativeModel({ model: "gemini-pro-vision" });

export interface BusinessLocation {
    latitude: number;
    longitude: number;
    address: string;
}

export interface BusinessHours {
    day: string;
    open: string;
    close: string;
}

export interface Business {
    id: string;
    fullName: string;
    businessName: string;
    category: string;
    subcategories: string[];
    description: string;
    location: BusinessLocation;
    contactPhone: string;
    contactEmail: string;
    businessHours: BusinessHours[];
    amenities: string[];
    priceRange: string;
    images: string[];
    idDocument: {
        type: 'passport' | 'nationalId';
        number: string;
        verificationStatus: 'pending' | 'verified' | 'rejected';
        documentUrl: string;
    };
    verificationStatus: 'pending' | 'verified' | 'rejected';
    embedding?: number[];
    createdAt: string;
    updatedAt: string;
}

export const businessService = {
    // Generate embeddings for business data
    async generateEmbeddings(business: Partial<Business>): Promise<number[]> {
        const businessText = `
            ${business.businessName}
            Category: ${business.category}
            Subcategories: ${business.subcategories?.join(', ')}
            Description: ${business.description}
            Location: ${business.location?.address}
            Amenities: ${business.amenities?.join(', ')}
            Price Range: ${business.priceRange}
        `.trim();

        const response = await ai.embeddings.create({
            model: "text-embedding-ada-002",
            input: businessText,
        });

        return response.data[0].embedding;
    },

    // Verify ID document using Gemini Vision for OCR and face detection
    async verifyIdentityDocument(documentUrl: string, fullName: string): Promise<{
        isValid: boolean;
        confidence: number;
        extractedName?: string;
        error?: string;
    }> {
        try {
            // Convert document URL to base64
            const response = await fetch(documentUrl);
            const blob = await response.blob();
            const base64data = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });

            // Generate prompt for ID verification
            const prompt = `Please analyze this ID document image and verify:
1. Is this a valid ID or passport?
2. Extract the full name from the document
3. Check if the document appears authentic
4. Verify if the extracted name matches: ${fullName}

Please respond in a structured format with confidence scores.`;

            const result = await geminiVisionModel.generateContent([
                prompt,
                { inlineData: { data: base64data, mimeType: "image/jpeg" } }
            ]);

            const response = await result.response;
            const text = response.text();

            // Parse the response to determine validity
            const isNameMatch = text.toLowerCase().includes(fullName.toLowerCase());
            const isValidDocument = text.toLowerCase().includes("valid") && !text.toLowerCase().includes("not valid");
            
            return {
                isValid: isNameMatch && isValidDocument,
                confidence: isNameMatch && isValidDocument ? 0.95 : 0.1,
                extractedName: fullName, // Use the actual extracted name from Gemini's response
            };
        } catch (error) {
            console.error('Document verification error:', error);
            return {
                isValid: false,
                confidence: 0,
                error: 'Failed to verify document'
            };
        }
    },

    // Save business data (mock implementation - replace with actual database integration)
    async saveBusiness(businessData: Partial<Business>): Promise<Business> {
        const embedding = await this.generateEmbeddings(businessData);
        
        const business: Business = {
            id: uuidv4(),
            ...businessData,
            embedding,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            verificationStatus: 'pending'
        } as Business;

        // TODO: Save to actual database
        console.log('Saving business:', business);
        
        return business;
    },

    // Search for businesses using AI embeddings
    async searchBusinesses(query: string, filters?: {
        category?: string;
        priceRange?: string;
        amenities?: string[];
    }): Promise<Business[]> {
        // TODO: Implement actual vector search against database
        // This would include:
        // 1. Generate embedding for search query
        // 2. Perform vector similarity search
        // 3. Apply filters
        // 4. Return results

        return []; // Mock implementation
    }
};
