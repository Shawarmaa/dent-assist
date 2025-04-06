import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// Language codes map for better prompting
const languageMap: Record<string, string> = {
  'en': 'English',
  'fr': 'French',
  'es': 'Spanish',
  'nl': 'Dutch',
  'de': 'German',
  'hi': 'Hindi',
  'ar': 'Arabic',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'pt': 'Portuguese',
  'ru': 'Russian'
};

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { text, targetLanguage } = body;
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    if (!targetLanguage) {
      return NextResponse.json(
        { error: 'Target language is required' },
        { status: 400 }
      );
    }

    // Get the language name for better prompting
    const languageName = languageMap[targetLanguage] || targetLanguage;
    
    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Create the prompt for translation
    const prompt = `Translate the following text into ${languageName}. Maintain the original meaning, tone, and formatting as closely as possible. Only return the translated text without any additional explanations or notes.

Original text:
${text}`;
    
    // Generate the translation
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();
    
    // Return the translated text
    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Error translating text:', error);
    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    );
  }
}
