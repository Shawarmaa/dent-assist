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
    model: "gemini-2.0-flash",
    ...geminiConfig,
});

interface GenerateResponse {
    response: {
        text: () => string;
    };
}

// Next.js App Router API handler
export async function POST(request: NextRequest) {
    try {
        // Parse the request body
        const body = await request.json();
        const { transcript } = body;
        
        // Use the transcript in the prompt if provided
        const prompt = `
        You are a dental assistant AI.
      
        Given the following transcript of a dentist speaking during a procedure, extract:
        1. A structured list of procedures in JSON format
        2. A technical summary (for another dentist)
        3. A simplified summary (for the patient)
      
        IMPORTANT: You must respond ONLY with valid JSON matching this exact structure:
        {
          "log": [
            { "tooth": 26, "procedure": "cavity", "surface": "occlusal" },
            { "tooth": 14, "procedure": "filling", "surface": "buccal" },
            { "tooth": 47, "procedure": "extraction", "surface": null }
          ],
          "summary_dentist": "Tooth 26 has occlusal caries. Composite placed on the buccal surface of tooth 14. Tooth 47 was extracted.",
          "summary_patient": "We found a small cavity on one of your back teeth, placed a filling on another, and removed one tooth."
        }
      
        Only use these procedure types: "cavity", "filling", "extraction", "examination", "cleaning", "crown"
        Surface values should be one of: "occlusal", "buccal", "lingual", "mesial", "distal", null
      
        Now process this transcript:
        "${transcript}"
      
        Remember, respond with ONLY the JSON object and absolutely nothing else - no markdown, no code blocks, no backticks.
      `;

        
        const result: GenerateResponse = await geminiModel.generateContent(prompt);
        let responseText = result.response.text();
        
        // Clean up the response by removing markdown code blocks
        responseText = responseText.replace(/```json\n|\n```|`/g, '');
        
        // Try to parse and validate the JSON
        try {
            const parsedJson = JSON.parse(responseText);
            responseText = JSON.stringify(parsedJson);
        } catch (jsonError) {
            console.error("Error parsing JSON from LLM:", jsonError);
            // If we can't parse it, just use the cleaned text
        }
        
        // Return successful response
        return NextResponse.json({ 
            success: true, 
            response: responseText 
        });
    } catch (error: unknown) {
        console.error("LLM API error:", error);
        
        // Return error response
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
        }, { status: 500 });
    }
}