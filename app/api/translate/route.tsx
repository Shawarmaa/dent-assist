import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

const googleAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiConfig = {
    temperature: 0.9,
    topP: 1,
    topK: 1,
    maxOutputTokens: 4096,
};

const geminiModel = googleAI.getGenerativeModel({
    model: "gemini-2.5-pro-preview-03-25",
    ...geminiConfig,
});

interface GenerateResponse {
    response: {
        text: () => string;
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text, targetLanguage } = body;

        if (!text || !targetLanguage) {
            return NextResponse.json({ error: 'Missing text or target language' }, { status: 400 });
        }

        const prompt = `Translate the following text to ${targetLanguage}:\n\n${text} Please provide only one translation not multiple options`;
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const translatedText = response.text();    

        return new NextResponse(translatedText, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
            },
        });
        
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}